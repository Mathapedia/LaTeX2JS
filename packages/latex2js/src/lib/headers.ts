export const Expressions = {
  bq: /\\begin\{quotation\}/,
  claim: /\\begin\{claim\*?\}/,
  corollary: /\\begin\{corollary\*?\}/,
  definition: /\\begin\{definition\*?\}/,
  lemma: /\\begin\{lemma\*?\}/,
  proposition: /\\begin\{proposition\*?\}/,
  axiom: /\\begin\{axiom\*?\}/,
  remark: /\\begin\{remark\*?\}/,
  note: /\\begin\{note\*?\}/,
  exercise: /\\begin\{exercise\*?\}/,
  question: /\\begin\{question\*?\}/,
  endclaim: /\\end\{claim\*?\}/,
  endcorollary: /\\end\{corollary\*?\}/,
  enddefinition: /\\end\{definition\*?\}/,
  endexample: /\\end\{example\*?\}/,
  endlemma: /\\end\{lemma\*?\}/,
  endproposition: /\\end\{proposition\*?\}/,
  endaxiom: /\\end\{axiom\*?\}/,
  endremark: /\\end\{remark\*?\}/,
  endnote: /\\end\{note\*?\}/,
  endexercise: /\\end\{exercise\*?\}/,
  endquestion: /\\end\{question\*?\}/,
  endproblem: /\\end\{problem\*?\}/,
  endsolution: /\\end\{solution\*?\}/,
  endtheorem: /\\end\{theorem\*?\}/,
  eq: /\\end\{quotation\}/,
  example: /\\begin\{example\*?\}/,
  problem: /\\begin\{problem\*?\}/,
  proof: /\\begin\{proof\}/,
  qed: /\\end\{proof\}/,
  solution: /\\begin\{solution\*?\}/,
  theorem: /\\begin\{theorem\*?\}/
};


/**
 * Renders a theorem-like heading, numbered unless the environment is starred.
 *
 * The number comes from the parser through the receiver, so this registry
 * carries no parser internals; a host that supplies none still renders the
 * heading, just unnumbered. Each kind counts independently — Theorem 1 and
 * Lemma 1 can both exist — which is what a plain \newtheorem gives.
 *
 * @param title - the label a reader sees, such as `Theorem`
 * @param name - the environment name, for the counter
 * @param parser - the receiver, when the caller supplied one
 * @param match - the matched \begin, so a starred form can opt out
 * @returns the heading markup
 */
function headed(title: string, name: string, parser: any, match?: any): string {
  const raw = Array.isArray(match) ? String(match[0] ?? '') : String(match ?? '');
  const number = parser && typeof parser.environmentNumber === 'function'
    ? parser.environmentNumber(name, raw)
    : null;
  const label = number === null || number === undefined ? '' : ' ' + number;
  return '<h4>' + title + label + '</h4>';
}

export const Functions = {
  bq: () => '<p class="quotation">',
  claim(this: any, m?: any) { return headed('Claim', 'claim', this, m); },
  corollary(this: any, m?: any) { return headed('Corollary', 'corollary', this, m); },
  definition(this: any, m?: any) { return headed('Definition', 'definition', this, m); },
  lemma(this: any, m?: any) { return headed('Lemma', 'lemma', this, m); },
  proposition(this: any, m?: any) { return headed('Proposition', 'proposition', this, m); },
  axiom(this: any, m?: any) { return headed('Axiom', 'axiom', this, m); },
  remark(this: any, m?: any) { return headed('Remark', 'remark', this, m); },
  note(this: any, m?: any) { return headed('Note', 'note', this, m); },
  exercise(this: any, m?: any) { return headed('Exercise', 'exercise', this, m); },
  question(this: any, m?: any) { return headed('Question', 'question', this, m); },
  endclaim: () => '',
  endcorollary: () => '',
  enddefinition: () => '',
  endexample: () => '',
  endlemma: () => '',
  endproposition: () => '',
  endaxiom: () => '',
  endremark: () => '',
  endnote: () => '',
  endexercise: () => '',
  endquestion: () => '',
  endproblem: () => '',
  endsolution: () => '',
  endtheorem: () => '',
  eq: () => '</p>',
  example(this: any, m?: any) { return headed('Example', 'example', this, m); },
  problem(this: any, m?: any) { return headed('Problem', 'problem', this, m); },
  proof: () => '<h4>Proof</h4>',
  // amsthm closes a proof with an open square. Emitted as a character rather
  // than as math: MathJax defines no \qed, so the previous `$\qed$` surfaced
  // an "Undefined control sequence" box at the end of every proof.
  qed: () => '<span class="qed">□</span>',
  solution(this: any, m?: any) { return headed('Solution', 'solution', this, m); },
  theorem(this: any, m?: any) { return headed('Theorem', 'theorem', this, m); }
};

export default {
  Expressions,
  Functions
};
