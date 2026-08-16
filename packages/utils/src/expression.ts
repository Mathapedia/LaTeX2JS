/**
 * Algebraic expression parser + evaluator for PSTricks-style math.
 *
 * PSTricks `algebraic` expressions are NOT JavaScript: they use `^` for
 * power, allow implicit multiplication (`2x`, `2(x+1)`, `2sin(x)`), and rely
 * on bare math function names (`cos(x)`). This module parses an expression
 * once into an AST and compiles it to a JavaScript closure that can be
 * evaluated cheaply many times with a variable scope — exactly the
 * compile-once / evaluate-many pattern the interactive plot and userline
 * paths need.
 *
 * Supported syntax:
 *   numbers, identifiers (variables), arithmetic + - * / ^,
 *   unary minus/plus, implicit multiplication, parentheses,
 *   function calls (cos, sin, tan, atan, atan2, pow, sqrt, abs, exp, ln,
 *   log, floor, ceil, round, min, max, ...), comparisons (< > <= >= == !=),
 *   and ternary conditionals (cond ? a : b).
 */

export class ExpressionError extends Error {
  position: number;
  line: number;
  column: number;

  constructor(message: string, position: number) {
    // position is a 0-based offset; compute 1-based line/column lazily
    super(message);
    this.name = 'ExpressionError';
    this.position = position;
    this.line = 0;
    this.column = 0;
  }
}

export interface CompiledExpression {
  /** Evaluate with a variable scope. */
  evaluate(scope?: Record<string, number>): number;
  /** The generated JavaScript body (for debugging). */
  toJS(): string;
  /** Identifiers referenced (excluding math functions/constants). */
  variables(): string[];
  source: string;
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

type TokenType = 'number' | 'ident' | 'op' | 'paren' | 'eof';

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

const OPS = ['<=', '>=', '==', '!=', '<', '>', '?', ':', '+', '-', '*', '/', '^', ','];
const PARENS = new Set(['(', ')']);

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = source.length;

  const numberRe = /^\d*\.?\d+(?:[eE][+-]?\d+)?/;
  const identRe = /^[a-zA-Z_][a-zA-Z0-9_]*/;

  while (i < n) {
    const ch = source[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    // Unicode pi
    if (ch === 'π') {
      tokens.push({ type: 'ident', value: 'π', pos: i });
      i++;
      continue;
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch, pos: i });
      i++;
      continue;
    }
    const num = source.slice(i).match(numberRe);
    if (num) {
      tokens.push({ type: 'number', value: num[0], pos: i });
      i += num[0].length;
      continue;
    }
    const ident = source.slice(i).match(identRe);
    if (ident) {
      tokens.push({ type: 'ident', value: ident[0], pos: i });
      i += ident[0].length;
      continue;
    }
    const op = OPS.find((o) => source.startsWith(o, i));
    if (op) {
      tokens.push({ type: op === '(' || op === ')' ? 'paren' : 'op', value: op, pos: i });
      i += op.length;
      continue;
    }
    throw new ExpressionError(`unexpected character '${ch}'`, i);
  }
  tokens.push({ type: 'eof', value: '', pos: n });
  return tokens;
}

// ---------------------------------------------------------------------------
// Parser (recursive descent with precedence climbing)
// ---------------------------------------------------------------------------

interface Node {
  type: string;
  [key: string]: any;
}

class Parser {
  private tokens: Token[];
  private index = 0;

  constructor(private source: string) {
    this.tokens = tokenize(source);
    if (this.tokens.length <= 1) {
      throw new ExpressionError('empty expression', 0);
    }
  }

  private peek(): Token {
    return this.tokens[this.index];
  }

  private next(): Token {
    return this.tokens[this.index++];
  }

  private expect(value: string): Token {
    const t = this.peek();
    if (t.value !== value) {
      throw new ExpressionError(`expected '${value}' but found '${t.value || 'end of input'}'`, t.pos);
    }
    return this.next();
  }

  parse(): Node {
    const node = this.parseTernary();
    const t = this.peek();
    if (t.type !== 'eof') {
      throw new ExpressionError(`unexpected '${t.value}'`, t.pos);
    }
    return node;
  }

  private parseTernary(): Node {
    const cond = this.parseComparison();
    if (this.peek().value === '?') {
      this.next();
      const then = this.parseTernary();
      this.expect(':');
      const els = this.parseTernary();
      return { type: 'ternary', cond, then, els };
    }
    return cond;
  }

  private parseComparison(): Node {
    let left = this.parseAdditive();
    for (;;) {
      const op = this.peek().value;
      if (op === '<' || op === '>' || op === '<=' || op === '>=' || op === '==' || op === '!=') {
        this.next();
        const right = this.parseAdditive();
        left = { type: 'binary', op, left, right };
      } else {
        return left;
      }
    }
  }

  private parseAdditive(): Node {
    let left = this.parseMultiplicative();
    for (;;) {
      const op = this.peek().value;
      if (op === '+' || op === '-') {
        this.next();
        const right = this.parseMultiplicative();
        left = { type: 'binary', op, left, right };
      } else {
        return left;
      }
    }
  }

  private parseMultiplicative(): Node {
    let left = this.parseUnary();
    for (;;) {
      const op = this.peek().value;
      if (op === '*' || op === '/') {
        this.next();
        const right = this.parseUnary();
        left = { type: 'binary', op, left, right };
      } else if (this.isImplicitStart(this.peek())) {
        // implicit multiplication: 2x, 2(x+1), (x+1)(x+2), 2sin(x)
        const right = this.parseUnary();
        left = { type: 'binary', op: '*', left, right };
      } else {
        return left;
      }
    }
  }

  private parseUnary(): Node {
    const op = this.peek().value;
    if (op === '-' || op === '+') {
      this.next();
      return { type: 'unary', op, operand: this.parseUnary() };
    }
    return this.parsePower();
  }

  private parsePower(): Node {
    const left = this.parsePrimary();
    if (this.peek().value === '^') {
      this.next();
      const right = this.parseUnary(); // right-associative, binds tighter on the right
      return { type: 'binary', op: '^', left, right };
    }
    return left;
  }

  private parsePrimary(): Node {
    const t = this.peek();
    if (t.type === 'number') {
      this.next();
      return { type: 'number', value: t.value };
    }
    if (t.type === 'ident') {
      this.next();
      // a known math function followed by '(' is a function call
      if (this.peek().value === '(' && MATH_FUNCTIONS.hasOwnProperty(t.value)) {
        this.next(); // consume '('
        const args: Node[] = [];
        if (this.peek().value !== ')') {
          args.push(this.parseTernary());
          while (this.peek().value === ',') {
            this.next();
            args.push(this.parseTernary());
          }
        }
        this.expect(')');
        return { type: 'call', name: t.value, args };
      }
      return { type: 'var', name: t.value };
    }
    if (t.value === '(') {
      this.next();
      const node = this.parseTernary();
      this.expect(')');
      return node;
    }
    throw new ExpressionError(
      `unexpected '${t.value || 'end of input'}' in expression`,
      t.pos
    );
  }

  /** A token that can start an implicit multiplication operand. */
  private isImplicitStart(t: Token): boolean {
    return t.type === 'number' || t.type === 'ident' || t.value === '(';
  }
}

// ---------------------------------------------------------------------------
// Compile AST → JS closure
// ---------------------------------------------------------------------------

export const MATH_FUNCTIONS: Record<string, string> = {
  cos: 'Math.cos',
  sin: 'Math.sin',
  tan: 'Math.tan',
  atan: 'Math.atan',
  atan2: 'Math.atan2',
  asin: 'Math.asin',
  acos: 'Math.acos',
  exp: 'Math.exp',
  ln: 'Math.log',
  log: 'Math.log',
  log10: 'Math.log10',
  sqrt: 'Math.sqrt',
  cbrt: 'Math.cbrt',
  abs: 'Math.abs',
  sign: 'Math.sign',
  floor: 'Math.floor',
  ceil: 'Math.ceil',
  round: 'Math.round',
  pow: 'Math.pow',
  min: 'Math.min',
  max: 'Math.max',
  sinh: 'Math.sinh',
  cosh: 'Math.cosh',
  tanh: 'Math.tanh',
};

export const MATH_CONSTANTS: Record<string, string> = {
  pi: 'Math.PI',
  π: 'Math.PI',
  PI: 'Math.PI',
  E: 'Math.E',
};

function compileNode(node: Node, variableNames: Set<string>): string {
  switch (node.type) {
    case 'number':
      return node.value;
    case 'var': {
      if (MATH_CONSTANTS.hasOwnProperty(node.name)) {
        return MATH_CONSTANTS[node.name];
      }
      variableNames.add(node.name);
      return 'v.' + node.name;
    }
    case 'call': {
      const target = MATH_FUNCTIONS.hasOwnProperty(node.name)
        ? MATH_FUNCTIONS[node.name]
        : '(v.' + node.name + ')';
      return target + '(' + node.args.map((a: Node) => compileNode(a, variableNames)).join(',') + ')';
    }
    case 'unary':
      return '(' + node.op + compileNode(node.operand, variableNames) + ')';
    case 'binary': {
      const op = node.op === '^' ? '**' : node.op;
      return '(' + compileNode(node.left, variableNames) + op + compileNode(node.right, variableNames) + ')';
    }
    case 'ternary':
      return (
        '(' +
        compileNode(node.cond, variableNames) +
        '?' +
        compileNode(node.then, variableNames) +
        ':' +
        compileNode(node.els, variableNames) +
        ')'
      );
    default:
      throw new Error('unknown node type ' + node.type);
  }
}

/**
 * Parse an algebraic expression and compile it to an evaluable closure.
 * Throws ExpressionError with a character position on invalid syntax.
 */
export function parseExpression(source: string): CompiledExpression {
  const trimmed = source.trim();
  if (!trimmed) {
    throw new ExpressionError('empty expression', 0);
  }
  const parser = new Parser(trimmed);
  const ast = parser.parse();
  const variableNames = new Set<string>();
  const js = compileNode(ast, variableNames);

  let fn: (v: any) => number;
  try {
    // eslint-disable-next-line no-new-func
    fn = new Function('v', 'return (' + js + ');') as (v: any) => number;
  } catch (err) {
    throw new ExpressionError('could not compile expression: ' + (err as Error).message, 0);
  }

  return {
    source: trimmed,
    toJS: () => js,
    variables: () => Array.from(variableNames),
    evaluate: (scope?: Record<string, number>) => fn(scope || {}),
  };
}
