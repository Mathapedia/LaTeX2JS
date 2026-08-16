// ============================================================================
// latex2js document grammar (Peggy)
//
// This grammar is deliberately GENERIC and STRUCTURAL: it tokenizes a
// LaTeX-ish document into an ordered tree of segments (environments, commands,
// text lines) with locations, but makes no semantic decisions. Interpretation
// (which environments are structural, which commands map to PSTricks data,
// text/header transforms) happens registry-driven in lib/parser.ts, so the
// runtime extension API (addEnvironment / addText / addHeaders) keeps working
// without regenerating the parser.
//
// What the grammar fixes versus the old line-based regex parser:
//   * inline `%` comments as a lexical rule (stripped everywhere)
//   * commands spanning multiple lines (args tracked by brace depth)
//   * an ordered tree → source-order rendering + real diagnostics
//   * verbatim/print swallow everything until their matching \end
// ============================================================================

{
  let depth = 0;

  function loc() {
    const l = location();
    return { line: l.start.line, column: l.start.column };
  }
}

Document = segs:Segment* { return segs; }

Segment
  = Env
  / StrayEnd
  / Line

StrayEnd = e:EndTag { return { kind: 'strayEnd', name: e.name, raw: e.raw, loc: loc() }; }

// ---------------------------------------------------------------------------
// Environments
// ---------------------------------------------------------------------------

Env
  = VerbatimEnv
  / RegularEnv

// verbatim and print swallow raw content (including \begin / \end of other
// environments) until their own matching \end — mirroring the old behavior.
VerbatimEnv
  = start:BeginVerb content:(!EndVerb .)* end:EndVerb {
      return {
        kind: 'env',
        name: start.name,
        verbatim: true,
        begin: start,
        end: { name: start.name, raw: '\\end{' + end + '}', loc: loc() },
        content: [{
          kind: 'verbatim',
          text: content.map((pair) => pair[1]).join('').replace(/\n$/, '')
        }],
        loc: loc()
      };
    }

BeginVerb = "\\begin{" n:("verbatim" / "print") "}" { return { name: n, raw: '\\begin{' + n + '}', loc: loc() }; }
EndVerb = "\\end{" n:("verbatim" / "print") "}" { return n; }

// Regular environments pair a generic \begin{name} with a generic \end{name}.
// The `end` is optional so unclosed environments surface as diagnostics
// instead of a hard parse error; name mismatch is reported in parser.ts.
RegularEnv
  = b:BeginTag _ content:EnvContent* _ e:EndTag? {
      return { kind: 'env', name: b.name, verbatim: false, begin: b, end: e || null, content: content, loc: loc() };
    }

BeginTag
  = "\\begin{" name:EnvName "}" tail:Tail {
      return { name: name, raw: '\\begin{' + name + '}' + tail, loc: loc() };
    }

EndTag
  = "\\end{" name:EnvName "}" {
      return { name: name, raw: '\\end{' + name + '}', loc: loc() };
    }

EnvName = chars:[a-zA-Z*]+ { return chars.join(''); }

EnvContent
  = Env
  / Command
  / Line

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

Command
  = start:CommandStart tail:Tail {
      depth = 0;
      return { kind: 'command', name: start.name, raw: start.raw + tail, loc: loc() };
    }

CommandStart = "\\" !("begin{") !("end{") chars:[a-zA-Z@]+ {
  return { name: chars.join(''), raw: '\\' + chars.join('') };
}

// Tail consumes the argument groups ([...], {...}, (...)) of a command or a
// \begin tag. Brace/paren/bracket depth is tracked so newlines and comments
// are legal inside args but a command still ends at a newline or the start of
// the next command at depth 0.
Tail = parts:TailPart* { return parts.join(''); }

TailPart
  = Comment
  / Open { depth++; return text(); }
  / Close { depth = Math.max(0, depth - 1); return text(); }
  / &{ return depth === 0; } !EOL !CommandStart !BeginStart !EndStart c:. { return c; }
  / &{ return depth > 0; } c:. { return c; }

Comment = "%" (!EOL .)* { return ''; }

Open = "[" / "{" / "("
Close = "]" / "}" / ")"

BeginStart = "\\begin{"
EndStart = "\\end{"

// ---------------------------------------------------------------------------
// Text lines
// ---------------------------------------------------------------------------

Line
  = parts:LinePart+ eol:EOL? { return { kind: 'line', parts: parts, hasEol: !!eol, loc: loc() }; }
  / eol:EOL { return { kind: 'line', parts: [], hasEol: true, loc: loc() }; }

LinePart
  = Comment
  / Command
  / !BeginStart !EndStart !EOL c:. { return { kind: 'char', c: c, loc: loc() }; }

EOL = "\r\n" / "\n" / "\r"

_ = [ \t]*
// drift
