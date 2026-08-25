"use strict";
var LaTeX2HTML5 = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../latex2js/src/grammar/parser.js
  var require_parser = __commonJS({
    "../latex2js/src/grammar/parser.js"(exports, module) {
      "use strict";
      var peg$SyntaxError = class extends SyntaxError {
        constructor(message, expected, found, location2) {
          super(message);
          this.expected = expected;
          this.found = found;
          this.location = location2;
          this.name = "SyntaxError";
        }
        format(sources) {
          let str = "Error: " + this.message;
          if (this.location) {
            let src = null;
            const st = sources.find((s2) => s2.source === this.location.source);
            if (st) {
              src = st.text.split(/\r\n|\n|\r/g);
            }
            const s = this.location.start;
            const offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
            const loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
            if (src) {
              const e = this.location.end;
              const filler = "".padEnd(offset_s.line.toString().length, " ");
              const line = src[s.line - 1];
              const last = s.line === e.line ? e.column : line.length + 1;
              const hatLen = last - s.column || 1;
              str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + "".padEnd(s.column - 1, " ") + "".padEnd(hatLen, "^");
            } else {
              str += "\n at " + loc;
            }
          }
          return str;
        }
        static buildMessage(expected, found) {
          function hex(ch) {
            return ch.codePointAt(0).toString(16).toUpperCase();
          }
          const nonPrintable = Object.prototype.hasOwnProperty.call(RegExp.prototype, "unicode") ? new RegExp("[\\p{C}\\p{Mn}\\p{Mc}]", "gu") : null;
          function unicodeEscape(s) {
            if (nonPrintable) {
              return s.replace(nonPrintable, (ch) => "\\u{" + hex(ch) + "}");
            }
            return s;
          }
          function literalEscape(s) {
            return unicodeEscape(s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch)).replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x" + hex(ch)));
          }
          function classEscape(s) {
            return unicodeEscape(s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch)).replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x" + hex(ch)));
          }
          const DESCRIBE_EXPECTATION_FNS = {
            literal(expectation) {
              return '"' + literalEscape(expectation.text) + '"';
            },
            class(expectation) {
              const escapedParts = expectation.parts.map(
                (part) => Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part)
              );
              return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]" + (expectation.unicode ? "u" : "");
            },
            any() {
              return "any character";
            },
            end() {
              return "end of input";
            },
            other(expectation) {
              return expectation.description;
            }
          };
          function describeExpectation(expectation) {
            return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
          }
          function describeExpected(expected2) {
            const descriptions = expected2.map(describeExpectation);
            descriptions.sort();
            if (descriptions.length > 0) {
              let j = 1;
              for (let i = 1; i < descriptions.length; i++) {
                if (descriptions[i - 1] !== descriptions[i]) {
                  descriptions[j] = descriptions[i];
                  j++;
                }
              }
              descriptions.length = j;
            }
            switch (descriptions.length) {
              case 1:
                return descriptions[0];
              case 2:
                return descriptions[0] + " or " + descriptions[1];
              default:
                return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
            }
          }
          function describeFound(found2) {
            return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
          }
          return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
        }
      };
      function peg$parse(input, options) {
        options = options !== void 0 ? options : {};
        const peg$FAILED = {};
        const peg$source = options.grammarSource;
        const peg$startRuleFunctions = {
          Document: peg$parseDocument
        };
        let peg$startRuleFunction = peg$parseDocument;
        const peg$c0 = "\\begin{";
        const peg$c1 = "verbatim";
        const peg$c2 = "print";
        const peg$c3 = "}";
        const peg$c4 = "\\end{";
        const peg$c5 = "\\";
        const peg$c6 = "begin{";
        const peg$c7 = "end{";
        const peg$c8 = "%";
        const peg$c9 = "\r\n";
        const peg$r0 = /^[a-zA-Z*]/;
        const peg$r1 = /^[a-zA-Z@]/;
        const peg$r2 = /^[([{]/;
        const peg$r3 = /^[)\]}]/;
        const peg$r4 = /^[\n\r]/;
        const peg$r5 = /^[ \t]/;
        const peg$e0 = peg$anyExpectation();
        const peg$e1 = peg$literalExpectation("\\begin{", false);
        const peg$e2 = peg$literalExpectation("verbatim", false);
        const peg$e3 = peg$literalExpectation("print", false);
        const peg$e4 = peg$literalExpectation("}", false);
        const peg$e5 = peg$literalExpectation("\\end{", false);
        const peg$e6 = peg$classExpectation([["a", "z"], ["A", "Z"], "*"], false, false, false);
        const peg$e7 = peg$literalExpectation("\\", false);
        const peg$e8 = peg$literalExpectation("begin{", false);
        const peg$e9 = peg$literalExpectation("end{", false);
        const peg$e10 = peg$classExpectation([["a", "z"], ["A", "Z"], "@"], false, false, false);
        const peg$e11 = peg$literalExpectation("%", false);
        const peg$e12 = peg$classExpectation(["(", "[", "{"], false, false, false);
        const peg$e13 = peg$classExpectation([")", "]", "}"], false, false, false);
        const peg$e14 = peg$literalExpectation("\r\n", false);
        const peg$e15 = peg$classExpectation(["\n", "\r"], false, false, false);
        const peg$e16 = peg$classExpectation([" ", "	"], false, false, false);
        function peg$f0(segs) {
          return segs;
        }
        function peg$f1(e) {
          return { kind: "strayEnd", name: e.name, raw: e.raw, loc: loc() };
        }
        function peg$f2(start, content, end) {
          return {
            kind: "env",
            name: start.name,
            verbatim: true,
            begin: start,
            end: { name: start.name, raw: "\\end{" + end + "}", loc: loc() },
            content: [{
              kind: "verbatim",
              text: content.map((pair) => pair[1]).join("").replace(/\n$/, "")
            }],
            loc: loc()
          };
        }
        function peg$f3(n) {
          return { name: n, raw: "\\begin{" + n + "}", loc: loc() };
        }
        function peg$f4(n) {
          return n;
        }
        function peg$f5(b, content, e) {
          return { kind: "env", name: b.name, verbatim: false, begin: b, end: e || null, content, loc: loc() };
        }
        function peg$f6(name, tail) {
          return { name, raw: "\\begin{" + name + "}" + tail, loc: loc() };
        }
        function peg$f7(name) {
          return { name, raw: "\\end{" + name + "}", loc: loc() };
        }
        function peg$f8(chars) {
          return chars.join("");
        }
        function peg$f9(start, tail) {
          depth = 0;
          return { kind: "command", name: start.name, raw: start.raw + tail, loc: loc() };
        }
        function peg$f10(chars) {
          return { name: chars.join(""), raw: "\\" + chars.join("") };
        }
        function peg$f11(parts) {
          return parts.join("");
        }
        function peg$f12() {
          depth++;
          return text();
        }
        function peg$f13() {
          depth = Math.max(0, depth - 1);
          return text();
        }
        function peg$f14() {
          return depth === 0;
        }
        function peg$f15(c) {
          return c;
        }
        function peg$f16() {
          return depth > 0;
        }
        function peg$f17(c) {
          return c;
        }
        function peg$f18() {
          return "";
        }
        function peg$f19(parts, eol) {
          return { kind: "line", parts, hasEol: !!eol, loc: loc() };
        }
        function peg$f20(eol) {
          return { kind: "line", parts: [], hasEol: true, loc: loc() };
        }
        function peg$f21(c) {
          return { kind: "char", c, loc: loc() };
        }
        let peg$currPos = options.peg$currPos | 0;
        let peg$savedPos = peg$currPos;
        const peg$posDetailsCache = [{ line: 1, column: 1 }];
        let peg$maxFailPos = peg$currPos;
        let peg$maxFailExpected = options.peg$maxFailExpected || [];
        let peg$silentFails = options.peg$silentFails | 0;
        let peg$result;
        if (options.startRule) {
          if (!(options.startRule in peg$startRuleFunctions)) {
            throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
          }
          peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
        }
        function text() {
          return input.substring(peg$savedPos, peg$currPos);
        }
        function offset() {
          return peg$savedPos;
        }
        function range() {
          return {
            source: peg$source,
            start: peg$savedPos,
            end: peg$currPos
          };
        }
        function location2() {
          return peg$computeLocation(peg$savedPos, peg$currPos);
        }
        function expected(description, location3) {
          location3 = location3 !== void 0 ? location3 : peg$computeLocation(peg$savedPos, peg$currPos);
          throw peg$buildStructuredError(
            [peg$otherExpectation(description)],
            input.substring(peg$savedPos, peg$currPos),
            location3
          );
        }
        function error(message, location3) {
          location3 = location3 !== void 0 ? location3 : peg$computeLocation(peg$savedPos, peg$currPos);
          throw peg$buildSimpleError(message, location3);
        }
        function peg$getUnicode(pos = peg$currPos) {
          const cp = input.codePointAt(pos);
          if (cp === void 0) {
            return "";
          }
          return String.fromCodePoint(cp);
        }
        function peg$literalExpectation(text2, ignoreCase) {
          return { type: "literal", text: text2, ignoreCase };
        }
        function peg$classExpectation(parts, inverted, ignoreCase, unicode) {
          return { type: "class", parts, inverted, ignoreCase, unicode };
        }
        function peg$anyExpectation() {
          return { type: "any" };
        }
        function peg$endExpectation() {
          return { type: "end" };
        }
        function peg$otherExpectation(description) {
          return { type: "other", description };
        }
        function peg$computePosDetails(pos) {
          let details = peg$posDetailsCache[pos];
          let p;
          if (details) {
            return details;
          } else {
            if (pos >= peg$posDetailsCache.length) {
              p = peg$posDetailsCache.length - 1;
            } else {
              p = pos;
              while (!peg$posDetailsCache[--p]) {
              }
            }
            details = peg$posDetailsCache[p];
            details = {
              line: details.line,
              column: details.column
            };
            while (p < pos) {
              if (input.charCodeAt(p) === 10) {
                details.line++;
                details.column = 1;
              } else {
                details.column++;
              }
              p++;
            }
            peg$posDetailsCache[pos] = details;
            return details;
          }
        }
        function peg$computeLocation(startPos, endPos, offset2) {
          const startPosDetails = peg$computePosDetails(startPos);
          const endPosDetails = peg$computePosDetails(endPos);
          const res = {
            source: peg$source,
            start: {
              offset: startPos,
              line: startPosDetails.line,
              column: startPosDetails.column
            },
            end: {
              offset: endPos,
              line: endPosDetails.line,
              column: endPosDetails.column
            }
          };
          if (offset2 && peg$source && typeof peg$source.offset === "function") {
            res.start = peg$source.offset(res.start);
            res.end = peg$source.offset(res.end);
          }
          return res;
        }
        function peg$fail(expected2) {
          if (peg$currPos < peg$maxFailPos) {
            return;
          }
          if (peg$currPos > peg$maxFailPos) {
            peg$maxFailPos = peg$currPos;
            peg$maxFailExpected = [];
          }
          peg$maxFailExpected.push(expected2);
        }
        function peg$buildSimpleError(message, location3) {
          return new peg$SyntaxError(message, null, null, location3);
        }
        function peg$buildStructuredError(expected2, found, location3) {
          return new peg$SyntaxError(
            peg$SyntaxError.buildMessage(expected2, found),
            expected2,
            found,
            location3
          );
        }
        function peg$parseDocument() {
          let s0, s1, s2;
          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parseSegment();
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseSegment();
          }
          peg$savedPos = s0;
          s1 = peg$f0(s1);
          s0 = s1;
          return s0;
        }
        function peg$parseSegment() {
          let s0;
          s0 = peg$parseEnv();
          if (s0 === peg$FAILED) {
            s0 = peg$parseStrayEnd();
            if (s0 === peg$FAILED) {
              s0 = peg$parseLine();
            }
          }
          return s0;
        }
        function peg$parseStrayEnd() {
          let s0, s1;
          s0 = peg$currPos;
          s1 = peg$parseEndTag();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f1(s1);
          }
          s0 = s1;
          return s0;
        }
        function peg$parseEnv() {
          let s0;
          s0 = peg$parseVerbatimEnv();
          if (s0 === peg$FAILED) {
            s0 = peg$parseRegularEnv();
          }
          return s0;
        }
        function peg$parseVerbatimEnv() {
          let s0, s1, s2, s3, s4, s5;
          s0 = peg$currPos;
          s1 = peg$parseBeginVerb();
          if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$currPos;
            peg$silentFails++;
            s5 = peg$parseEndVerb();
            peg$silentFails--;
            if (s5 === peg$FAILED) {
              s4 = void 0;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              if (input.length > peg$currPos) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e0);
                }
              }
              if (s5 !== peg$FAILED) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$currPos;
              s4 = peg$currPos;
              peg$silentFails++;
              s5 = peg$parseEndVerb();
              peg$silentFails--;
              if (s5 === peg$FAILED) {
                s4 = void 0;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
              if (s4 !== peg$FAILED) {
                if (input.length > peg$currPos) {
                  s5 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e0);
                  }
                }
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            }
            s3 = peg$parseEndVerb();
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f2(s1, s2, s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          return s0;
        }
        function peg$parseBeginVerb() {
          let s0, s1, s2, s3;
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 7) === peg$c0) {
            s1 = peg$c0;
            peg$currPos += 7;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e1);
            }
          }
          if (s1 !== peg$FAILED) {
            if (input.substr(peg$currPos, 8) === peg$c1) {
              s2 = peg$c1;
              peg$currPos += 8;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e2);
              }
            }
            if (s2 === peg$FAILED) {
              if (input.substr(peg$currPos, 5) === peg$c2) {
                s2 = peg$c2;
                peg$currPos += 5;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e3);
                }
              }
            }
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s3 = peg$c3;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e4);
                }
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f3(s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          return s0;
        }
        function peg$parseEndVerb() {
          let s0, s1, s2, s3;
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 5) === peg$c4) {
            s1 = peg$c4;
            peg$currPos += 5;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e5);
            }
          }
          if (s1 !== peg$FAILED) {
            if (input.substr(peg$currPos, 8) === peg$c1) {
              s2 = peg$c1;
              peg$currPos += 8;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e2);
              }
            }
            if (s2 === peg$FAILED) {
              if (input.substr(peg$currPos, 5) === peg$c2) {
                s2 = peg$c2;
                peg$currPos += 5;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e3);
                }
              }
            }
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s3 = peg$c3;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e4);
                }
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f4(s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          return s0;
        }
        function peg$parseRegularEnv() {
          let s0, s1, s2, s3, s4, s5;
          s0 = peg$currPos;
          s1 = peg$parseBeginTag();
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s3 = [];
            s4 = peg$parseEnvContent();
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseEnvContent();
            }
            s4 = peg$parse_();
            s5 = peg$parseEndTag();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            peg$savedPos = s0;
            s0 = peg$f5(s1, s3, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          return s0;
        }
        function peg$parseBeginTag() {
          let s0, s1, s2, s3, s4;
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 7) === peg$c0) {
            s1 = peg$c0;
            peg$currPos += 7;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e1);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseEnvName();
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s3 = peg$c3;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e4);
                }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parseTail();
                peg$savedPos = s0;
                s0 = peg$f6(s2, s4);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          return s0;
        }
        function peg$parseEndTag() {
          let s0, s1, s2, s3;
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 5) === peg$c4) {
            s1 = peg$c4;
            peg$currPos += 5;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e5);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseEnvName();
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s3 = peg$c3;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e4);
                }
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f7(s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          return s0;
        }
        function peg$parseEnvName() {
          let s0, s1, s2;
          s0 = peg$currPos;
          s1 = [];
          s2 = input.charAt(peg$currPos);
          if (peg$r0.test(s2)) {
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e6);
            }
          }
          if (s2 !== peg$FAILED) {
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = input.charAt(peg$currPos);
              if (peg$r0.test(s2)) {
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e6);
                }
              }
            }
          } else {
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f8(s1);
          }
          s0 = s1;
          return s0;
        }
        function peg$parseEnvContent() {
          let s0;
          s0 = peg$parseEnv();
          if (s0 === peg$FAILED) {
            s0 = peg$parseCommand();
            if (s0 === peg$FAILED) {
              s0 = peg$parseLine();
            }
          }
          return s0;
        }
        function peg$parseCommand() {
          let s0, s1, s2;
          s0 = peg$currPos;
          s1 = peg$parseCommandStart();
          if (s1 !== peg$FAILED) {
            s2 = peg$parseTail();
            peg$savedPos = s0;
            s0 = peg$f9(s1, s2);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          return s0;
        }
        function peg$parseCommandStart() {
          let s0, s1, s2, s3, s4, s5;
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 92) {
            s1 = peg$c5;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 6) === peg$c6) {
              s3 = peg$c6;
              peg$currPos += 6;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e8);
              }
            }
            peg$silentFails--;
            if (s3 === peg$FAILED) {
              s2 = void 0;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$currPos;
              peg$silentFails++;
              if (input.substr(peg$currPos, 4) === peg$c7) {
                s4 = peg$c7;
                peg$currPos += 4;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e9);
                }
              }
              peg$silentFails--;
              if (s4 === peg$FAILED) {
                s3 = void 0;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
              if (s3 !== peg$FAILED) {
                s4 = [];
                s5 = input.charAt(peg$currPos);
                if (peg$r1.test(s5)) {
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e10);
                  }
                }
                if (s5 !== peg$FAILED) {
                  while (s5 !== peg$FAILED) {
                    s4.push(s5);
                    s5 = input.charAt(peg$currPos);
                    if (peg$r1.test(s5)) {
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e10);
                      }
                    }
                  }
                } else {
                  s4 = peg$FAILED;
                }
                if (s4 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f10(s4);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          return s0;
        }
        function peg$parseTail() {
          let s0, s1, s2;
          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parseTailPart();
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseTailPart();
          }
          peg$savedPos = s0;
          s1 = peg$f11(s1);
          s0 = s1;
          return s0;
        }
        function peg$parseTailPart() {
          let s0, s1, s2, s3, s4, s5, s6;
          s0 = peg$parseComment();
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseOpen();
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$f12();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parseClose();
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f13();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                peg$savedPos = peg$currPos;
                s1 = peg$f14();
                if (s1) {
                  s1 = void 0;
                } else {
                  s1 = peg$FAILED;
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$currPos;
                  peg$silentFails++;
                  s3 = peg$parseEOL();
                  peg$silentFails--;
                  if (s3 === peg$FAILED) {
                    s2 = void 0;
                  } else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                  }
                  if (s2 !== peg$FAILED) {
                    s3 = peg$currPos;
                    peg$silentFails++;
                    s4 = peg$parseCommandStart();
                    peg$silentFails--;
                    if (s4 === peg$FAILED) {
                      s3 = void 0;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                    if (s3 !== peg$FAILED) {
                      s4 = peg$currPos;
                      peg$silentFails++;
                      s5 = peg$parseBeginStart();
                      peg$silentFails--;
                      if (s5 === peg$FAILED) {
                        s4 = void 0;
                      } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                      }
                      if (s4 !== peg$FAILED) {
                        s5 = peg$currPos;
                        peg$silentFails++;
                        s6 = peg$parseEndStart();
                        peg$silentFails--;
                        if (s6 === peg$FAILED) {
                          s5 = void 0;
                        } else {
                          peg$currPos = s5;
                          s5 = peg$FAILED;
                        }
                        if (s5 !== peg$FAILED) {
                          if (input.length > peg$currPos) {
                            s6 = input.charAt(peg$currPos);
                            peg$currPos++;
                          } else {
                            s6 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e0);
                            }
                          }
                          if (s6 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f15(s6);
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  peg$savedPos = peg$currPos;
                  s1 = peg$f16();
                  if (s1) {
                    s1 = void 0;
                  } else {
                    s1 = peg$FAILED;
                  }
                  if (s1 !== peg$FAILED) {
                    if (input.length > peg$currPos) {
                      s2 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e0);
                      }
                    }
                    if (s2 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f17(s2);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                }
              }
            }
          }
          return s0;
        }
        function peg$parseComment() {
          let s0, s1, s2, s3, s4, s5;
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 37) {
            s1 = peg$c8;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e11);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$currPos;
            peg$silentFails++;
            s5 = peg$parseEOL();
            peg$silentFails--;
            if (s5 === peg$FAILED) {
              s4 = void 0;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              if (input.length > peg$currPos) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e0);
                }
              }
              if (s5 !== peg$FAILED) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$currPos;
              s4 = peg$currPos;
              peg$silentFails++;
              s5 = peg$parseEOL();
              peg$silentFails--;
              if (s5 === peg$FAILED) {
                s4 = void 0;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
              if (s4 !== peg$FAILED) {
                if (input.length > peg$currPos) {
                  s5 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e0);
                  }
                }
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            }
            peg$savedPos = s0;
            s0 = peg$f18();
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          return s0;
        }
        function peg$parseOpen() {
          let s0;
          s0 = input.charAt(peg$currPos);
          if (peg$r2.test(s0)) {
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e12);
            }
          }
          return s0;
        }
        function peg$parseClose() {
          let s0;
          s0 = input.charAt(peg$currPos);
          if (peg$r3.test(s0)) {
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e13);
            }
          }
          return s0;
        }
        function peg$parseBeginStart() {
          let s0;
          if (input.substr(peg$currPos, 7) === peg$c0) {
            s0 = peg$c0;
            peg$currPos += 7;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e1);
            }
          }
          return s0;
        }
        function peg$parseEndStart() {
          let s0;
          if (input.substr(peg$currPos, 5) === peg$c4) {
            s0 = peg$c4;
            peg$currPos += 5;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e5);
            }
          }
          return s0;
        }
        function peg$parseLine() {
          let s0, s1, s2;
          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parseLinePart();
          if (s2 !== peg$FAILED) {
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parseLinePart();
            }
          } else {
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseEOL();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            peg$savedPos = s0;
            s0 = peg$f19(s1, s2);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseEOL();
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$f20(s1);
            }
            s0 = s1;
          }
          return s0;
        }
        function peg$parseLinePart() {
          let s0, s1, s2, s3, s4;
          s0 = peg$parseComment();
          if (s0 === peg$FAILED) {
            s0 = peg$parseCommand();
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$currPos;
              peg$silentFails++;
              s2 = peg$parseBeginStart();
              peg$silentFails--;
              if (s2 === peg$FAILED) {
                s1 = void 0;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseEndStart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                  s2 = void 0;
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$currPos;
                  peg$silentFails++;
                  s4 = peg$parseEOL();
                  peg$silentFails--;
                  if (s4 === peg$FAILED) {
                    s3 = void 0;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                  if (s3 !== peg$FAILED) {
                    if (input.length > peg$currPos) {
                      s4 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s4 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e0);
                      }
                    }
                    if (s4 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f21(s4);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            }
          }
          return s0;
        }
        function peg$parseEOL() {
          let s0;
          if (input.substr(peg$currPos, 2) === peg$c9) {
            s0 = peg$c9;
            peg$currPos += 2;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e14);
            }
          }
          if (s0 === peg$FAILED) {
            s0 = input.charAt(peg$currPos);
            if (peg$r4.test(s0)) {
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e15);
              }
            }
          }
          return s0;
        }
        function peg$parse_() {
          let s0, s1;
          s0 = [];
          s1 = input.charAt(peg$currPos);
          if (peg$r5.test(s1)) {
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e16);
            }
          }
          while (s1 !== peg$FAILED) {
            s0.push(s1);
            s1 = input.charAt(peg$currPos);
            if (peg$r5.test(s1)) {
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e16);
              }
            }
          }
          return s0;
        }
        let depth = 0;
        function loc() {
          const l = location2();
          return { line: l.start.line, column: l.start.column };
        }
        peg$result = peg$startRuleFunction();
        const peg$success = peg$result !== peg$FAILED && peg$currPos === input.length;
        function peg$throw() {
          if (peg$result !== peg$FAILED && peg$currPos < input.length) {
            peg$fail(peg$endExpectation());
          }
          throw peg$buildStructuredError(
            peg$maxFailExpected,
            peg$maxFailPos < input.length ? peg$getUnicode(peg$maxFailPos) : null,
            peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
          );
        }
        if (options.peg$library) {
          return (
            /** @type {any} */
            {
              peg$result,
              peg$currPos,
              peg$FAILED,
              peg$maxFailExpected,
              peg$maxFailPos,
              peg$success,
              peg$throw: peg$success ? void 0 : peg$throw
            }
          );
        }
        if (peg$success) {
          return peg$result;
        } else {
          peg$throw();
        }
      }
      module.exports = {
        StartRules: ["Document"],
        SyntaxError: peg$SyntaxError,
        parse: peg$parse
      };
    }
  });

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    DEFAULT_CONFIG: () => DEFAULT_CONFIG,
    default: () => render8,
    enumerate: () => render3,
    init: () => init,
    list: () => render4,
    macros: () => render7,
    math: () => render6,
    nicebox: () => render2,
    pspicture: () => render,
    verbatim: () => render5
  });

  // ../utils/src/expression.ts
  var ExpressionError = class extends Error {
    constructor(message, position) {
      super(message);
      this.name = "ExpressionError";
      this.position = position;
      this.line = 0;
      this.column = 0;
    }
  };
  var OPS = ["<=", ">=", "==", "!=", "<", ">", "?", ":", "+", "-", "*", "/", "^", ","];
  function tokenize(source) {
    const tokens = [];
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
      if (ch === "\u03C0") {
        tokens.push({ type: "ident", value: "\u03C0", pos: i });
        i++;
        continue;
      }
      if (ch === "(" || ch === ")") {
        tokens.push({ type: "paren", value: ch, pos: i });
        i++;
        continue;
      }
      const num = source.slice(i).match(numberRe);
      if (num) {
        tokens.push({ type: "number", value: num[0], pos: i });
        i += num[0].length;
        continue;
      }
      const ident = source.slice(i).match(identRe);
      if (ident) {
        tokens.push({ type: "ident", value: ident[0], pos: i });
        i += ident[0].length;
        continue;
      }
      const op = OPS.find((o) => source.startsWith(o, i));
      if (op) {
        tokens.push({ type: op === "(" || op === ")" ? "paren" : "op", value: op, pos: i });
        i += op.length;
        continue;
      }
      throw new ExpressionError(`unexpected character '${ch}'`, i);
    }
    tokens.push({ type: "eof", value: "", pos: n });
    return tokens;
  }
  var Parser = class {
    constructor(source) {
      this.source = source;
      this.index = 0;
      this.tokens = tokenize(source);
      if (this.tokens.length <= 1) {
        throw new ExpressionError("empty expression", 0);
      }
    }
    peek() {
      return this.tokens[this.index];
    }
    next() {
      return this.tokens[this.index++];
    }
    expect(value) {
      const t = this.peek();
      if (t.value !== value) {
        throw new ExpressionError(`expected '${value}' but found '${t.value || "end of input"}'`, t.pos);
      }
      return this.next();
    }
    parse() {
      const node = this.parseTernary();
      const t = this.peek();
      if (t.type !== "eof") {
        throw new ExpressionError(`unexpected '${t.value}'`, t.pos);
      }
      return node;
    }
    parseTernary() {
      const cond = this.parseComparison();
      if (this.peek().value === "?") {
        this.next();
        const then = this.parseTernary();
        this.expect(":");
        const els = this.parseTernary();
        return { type: "ternary", cond, then, els };
      }
      return cond;
    }
    parseComparison() {
      let left = this.parseAdditive();
      for (; ; ) {
        const op = this.peek().value;
        if (op === "<" || op === ">" || op === "<=" || op === ">=" || op === "==" || op === "!=") {
          this.next();
          const right = this.parseAdditive();
          left = { type: "binary", op, left, right };
        } else {
          return left;
        }
      }
    }
    parseAdditive() {
      let left = this.parseMultiplicative();
      for (; ; ) {
        const op = this.peek().value;
        if (op === "+" || op === "-") {
          this.next();
          const right = this.parseMultiplicative();
          left = { type: "binary", op, left, right };
        } else {
          return left;
        }
      }
    }
    parseMultiplicative() {
      let left = this.parseUnary();
      for (; ; ) {
        const op = this.peek().value;
        if (op === "*" || op === "/") {
          this.next();
          const right = this.parseUnary();
          left = { type: "binary", op, left, right };
        } else if (this.isImplicitStart(this.peek())) {
          const right = this.parseUnary();
          left = { type: "binary", op: "*", left, right };
        } else {
          return left;
        }
      }
    }
    parseUnary() {
      const op = this.peek().value;
      if (op === "-" || op === "+") {
        this.next();
        return { type: "unary", op, operand: this.parseUnary() };
      }
      return this.parsePower();
    }
    parsePower() {
      const left = this.parsePrimary();
      if (this.peek().value === "^") {
        this.next();
        const right = this.parseUnary();
        return { type: "binary", op: "^", left, right };
      }
      return left;
    }
    parsePrimary() {
      const t = this.peek();
      if (t.type === "number") {
        this.next();
        return { type: "number", value: t.value };
      }
      if (t.type === "ident") {
        this.next();
        if (this.peek().value === "(" && MATH_FUNCTIONS.hasOwnProperty(t.value)) {
          this.next();
          const args = [];
          if (this.peek().value !== ")") {
            args.push(this.parseTernary());
            while (this.peek().value === ",") {
              this.next();
              args.push(this.parseTernary());
            }
          }
          this.expect(")");
          return { type: "call", name: t.value, args };
        }
        return { type: "var", name: t.value };
      }
      if (t.value === "(") {
        this.next();
        const node = this.parseTernary();
        this.expect(")");
        return node;
      }
      throw new ExpressionError(
        `unexpected '${t.value || "end of input"}' in expression`,
        t.pos
      );
    }
    /** A token that can start an implicit multiplication operand. */
    isImplicitStart(t) {
      return t.type === "number" || t.type === "ident" || t.value === "(";
    }
  };
  var MATH_FUNCTIONS = {
    cos: "Math.cos",
    sin: "Math.sin",
    tan: "Math.tan",
    atan: "Math.atan",
    atan2: "Math.atan2",
    asin: "Math.asin",
    acos: "Math.acos",
    exp: "Math.exp",
    ln: "Math.log",
    log: "Math.log",
    log10: "Math.log10",
    sqrt: "Math.sqrt",
    cbrt: "Math.cbrt",
    abs: "Math.abs",
    sign: "Math.sign",
    floor: "Math.floor",
    ceil: "Math.ceil",
    round: "Math.round",
    pow: "Math.pow",
    min: "Math.min",
    max: "Math.max",
    sinh: "Math.sinh",
    cosh: "Math.cosh",
    tanh: "Math.tanh"
  };
  var MATH_CONSTANTS = {
    pi: "Math.PI",
    \u03C0: "Math.PI",
    PI: "Math.PI",
    // pst-plot's own spelling, used by \psplot expressions.
    Pi: "Math.PI",
    E: "Math.E"
  };
  function compileNode(node, variableNames) {
    switch (node.type) {
      case "number":
        return node.value;
      case "var": {
        if (MATH_CONSTANTS.hasOwnProperty(node.name)) {
          return MATH_CONSTANTS[node.name];
        }
        variableNames.add(node.name);
        return "v." + node.name;
      }
      case "call": {
        const target = MATH_FUNCTIONS.hasOwnProperty(node.name) ? MATH_FUNCTIONS[node.name] : "(v." + node.name + ")";
        return target + "(" + node.args.map((a) => compileNode(a, variableNames)).join(",") + ")";
      }
      case "unary":
        return "(" + node.op + compileNode(node.operand, variableNames) + ")";
      case "binary": {
        const op = node.op === "^" ? "**" : node.op;
        return "(" + compileNode(node.left, variableNames) + op + compileNode(node.right, variableNames) + ")";
      }
      case "ternary":
        return "(" + compileNode(node.cond, variableNames) + "?" + compileNode(node.then, variableNames) + ":" + compileNode(node.els, variableNames) + ")";
      default:
        throw new Error("unknown node type " + node.type);
    }
  }
  function parseExpression(source) {
    const trimmed = source.trim();
    if (!trimmed) {
      throw new ExpressionError("empty expression", 0);
    }
    const parser = new Parser(trimmed);
    const ast = parser.parse();
    const variableNames = /* @__PURE__ */ new Set();
    const js = compileNode(ast, variableNames);
    let fn;
    try {
      fn = new Function("v", "return (" + js + ");");
    } catch (err) {
      throw new ExpressionError("could not compile expression: " + err.message, 0);
    }
    return {
      source: trimmed,
      toJS: () => js,
      variables: () => Array.from(variableNames),
      evaluate: (scope) => fn(scope || {})
    };
  }

  // ../utils/src/svg-utils.ts
  var SVGSelection = class _SVGSelection {
    constructor(elements) {
      if (elements instanceof Element) {
        this.elements = [elements];
      } else if (elements instanceof NodeList) {
        this.elements = Array.from(elements).filter((node) => node.nodeType === Node.ELEMENT_NODE);
      } else {
        this.elements = Array.isArray(elements) ? elements : [];
      }
    }
    append(tagName) {
      const newElements = [];
      this.elements.forEach((parent) => {
        const elementName = tagName.startsWith("svg:") ? tagName.substring(4) : tagName;
        const element = document.createElementNS("http://www.w3.org/2000/svg", elementName);
        parent.appendChild(element);
        newElements.push(element);
      });
      return new _SVGSelection(newElements);
    }
    attr(name, value) {
      this.elements.forEach((el) => {
        el.setAttribute(name, String(value));
      });
      return this;
    }
    style(name, value) {
      this.elements.forEach((el) => {
        if (el instanceof SVGElement || el instanceof HTMLElement) {
          el.style[name] = String(value);
        }
      });
      return this;
    }
    selectAll(selector) {
      const selected = [];
      this.elements.forEach((parent) => {
        const found = parent.querySelectorAll(selector);
        selected.push(...Array.from(found));
      });
      return new _SVGSelection(selected);
    }
    remove() {
      this.elements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      return this;
    }
    on(event, handler) {
      this.elements.forEach((el) => {
        el.addEventListener(event, handler);
      });
      return this;
    }
    node() {
      return this.elements[0] || null;
    }
    /**
     * Sets an element's text content.
     *
     * `textContent` is defined on every Element, so no narrowing is needed — and
     * testing `instanceof SVGTextElement` threw a ReferenceError outright in any
     * DOM that does not expose that constructor as a global, jsdom included.
     */
    text(content) {
      this.elements.forEach((el) => {
        el.textContent = content;
      });
      return this;
    }
  };
  function select(selector) {
    if (typeof selector === "string") {
      const element = document.querySelector(selector);
      return new SVGSelection(element ? [element] : []);
    }
    return new SVGSelection(selector);
  }

  // ../utils/src/index.ts
  var simplerepl = function(regex, replace) {
    return function(_m, contents) {
      return contents.replace(regex, replace);
    };
  };
  var matchrepl = function(regex, callback) {
    return function(m, contents) {
      if (Array.isArray(m)) {
        m.forEach((match) => {
          var m2 = match.match(regex);
          contents = contents.replace(m2.input, callback.call(this, m2));
        });
      }
      return contents;
    };
  };
  var convertUnits = function(value) {
    var m = null;
    if (m = value.match(/([^c]+)\s*cm/)) {
      var num1 = Number(m[1]);
      return num1 * 50;
    } else if (m = value.match(/([^i]+)\s*in/)) {
      var num2 = Number(m[1]);
      return num2 * 20;
    } else if (m = value.match(/(.*)/)) {
      var num3 = Number(m[1]);
      return num3 * 50;
    } else {
      var num4 = Number(value);
      return num4;
    }
  };
  var RE = {
    options: "(\\[[^\\]]*\\])?",
    type: "(\\{[^\\}]*\\})?",
    squiggle: "\\{([^\\}]*)\\}",
    squiggleOpt: "(\\{[^\\}]*\\})?",
    coordsOpt: "(\\(\\s*([^\\)]*),([^\\)]*)\\s*\\))?",
    coords: "\\(\\s*([^\\)]*),([^\\)]*)\\s*\\)"
  };
  var COLOR_KEYS = ["linecolor", "fillcolor", "hatchcolor", "gridcolor", "bordercolor", "shadowcolor", "labelcolor"];
  var BASE_COLORS = {
    red: [255, 0, 0],
    green: [0, 255, 0],
    blue: [0, 0, 255],
    cyan: [0, 255, 255],
    magenta: [255, 0, 255],
    yellow: [255, 255, 0],
    black: [0, 0, 0],
    white: [255, 255, 255],
    gray: [128, 128, 128],
    grey: [128, 128, 128],
    darkgray: [64, 64, 64],
    lightgray: [191, 191, 191],
    brown: [191, 128, 64],
    lime: [191, 255, 0],
    orange: [255, 128, 0],
    pink: [255, 191, 191],
    purple: [191, 0, 64],
    teal: [0, 128, 128],
    violet: [128, 0, 128],
    olive: [128, 128, 0]
  };
  var DEFINED_COLORS = {};
  var resetDefinedColors = function() {
    for (const name of Object.keys(DEFINED_COLORS)) delete DEFINED_COLORS[name];
  };
  var clamp255 = (n) => Math.max(0, Math.min(255, Math.round(n)));
  var defineColor = function(name, model, spec) {
    const key = String(name ?? "").trim().toLowerCase();
    if (!key) return false;
    const parts = String(spec ?? "").split(",").map((p) => Number(p.trim()));
    const m = String(model ?? "").trim();
    if (m === "rgb" && parts.length >= 3 && parts.every(isFinite)) {
      DEFINED_COLORS[key] = [clamp255(parts[0] * 255), clamp255(parts[1] * 255), clamp255(parts[2] * 255)];
      return true;
    }
    if (m === "RGB" && parts.length >= 3 && parts.every(isFinite)) {
      DEFINED_COLORS[key] = [clamp255(parts[0]), clamp255(parts[1]), clamp255(parts[2])];
      return true;
    }
    if (m === "gray" && parts.length >= 1 && isFinite(parts[0])) {
      const g = clamp255(parts[0] * 255);
      DEFINED_COLORS[key] = [g, g, g];
      return true;
    }
    if (m === "cmyk" && parts.length >= 4 && parts.every(isFinite)) {
      const [c, y2, y3, k] = parts;
      DEFINED_COLORS[key] = [
        clamp255(255 * (1 - Math.min(1, c + k))),
        clamp255(255 * (1 - Math.min(1, y2 + k))),
        clamp255(255 * (1 - Math.min(1, y3 + k)))
      ];
      return true;
    }
    if (m === "HTML") {
      const hex = String(spec ?? "").trim().replace(/^#/, "");
      if (/^[0-9a-fA-F]{6}$/.test(hex)) {
        DEFINED_COLORS[key] = [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16)
        ];
        return true;
      }
    }
    return false;
  };
  var resolveColor = function(value) {
    const parts = String(value).split("!").map((p) => p.trim());
    const rgb = (name) => DEFINED_COLORS[name.toLowerCase()] ?? BASE_COLORS[name.toLowerCase()] ?? null;
    if (parts.length < 2) {
      const plain = rgb(parts[0]);
      return plain ? "rgb(" + plain[0] + "," + plain[1] + "," + plain[2] + ")" : value;
    }
    let current = rgb(parts[0]);
    if (!current) return value;
    for (let i = 1; i < parts.length; i += 2) {
      const pct = Number(parts[i]);
      if (!isFinite(pct)) return value;
      const against = parts[i + 1] ? rgb(parts[i + 1]) : [255, 255, 255];
      if (!against) return value;
      const w = Math.max(0, Math.min(100, pct)) / 100;
      current = [
        Math.round(current[0] * w + against[0] * (1 - w)),
        Math.round(current[1] * w + against[1] * (1 - w)),
        Math.round(current[2] * w + against[2] * (1 - w))
      ];
    }
    return "rgb(" + current[0] + "," + current[1] + "," + current[2] + ")";
  };
  var parseOptions = function(opts) {
    var options = opts.replace(/[\]\[]/g, "");
    var all = options.split(",");
    var obj = {};
    all.forEach((option) => {
      var kv = option.split("=");
      if (kv.length == 2) {
        const key = kv[0].trim();
        const value = kv[1].trim();
        obj[key] = COLOR_KEYS.indexOf(key) === -1 ? value : resolveColor(value);
      }
    });
    return obj;
  };
  var parseArrows = function(m) {
    var lineType = m;
    var arrows = [0, 0];
    var dots = [0, 0];
    if (lineType) {
      var type = lineType.match(/\{?([^\-{}]*)\-([^\-{}]*)\}?/);
      if (type) {
        if (type[1]) {
          if (type[1].match(/\*/)) {
            dots[0] = 1;
          } else if (type[1].match(/</)) {
            arrows[0] = 1;
          }
        }
        if (type[2]) {
          if (type[2].match(/\*/)) {
            dots[1] = 1;
          } else if (type[2].match(/>/)) {
            arrows[1] = 1;
          }
        }
      }
    }
    return {
      arrows,
      dots
    };
  };
  var normalizeArrows = function(obj) {
    if (!obj || typeof obj.arrows !== "string") return;
    const parsed = parseArrows(obj.arrows);
    obj.arrows = parsed.arrows;
    if (parsed.dots[0] || parsed.dots[1]) obj.dots = parsed.dots;
  };
  var evaluate = function(exp) {
    const num = Number(exp);
    if (!isNaN(num)) return num;
    this.variables = this.variables || {};
    try {
      return getCompiled(exp).evaluate(this.variables);
    } catch (e) {
      console.warn("Evaluation error:", e.message);
      return NaN;
    }
  };
  var expressionCache = /* @__PURE__ */ new Map();
  var EXPRESSION_CACHE_MAX = 500;
  function getCompiled(exp) {
    let compiled = expressionCache.get(exp);
    if (!compiled) {
      compiled = parseExpression(exp);
      if (expressionCache.size >= EXPRESSION_CACHE_MAX) {
        expressionCache.clear();
      }
      expressionCache.set(exp, compiled);
    }
    return compiled;
  }
  var X = function(v) {
    const numV = typeof v === "string" ? parseFloat(v) : v;
    if (isNaN(numV)) return NaN;
    if (isNaN(this.w) || isNaN(this.x1) || isNaN(this.xunit)) return NaN;
    if (this.xunit <= 0) return NaN;
    const result = (this.w - (this.x1 - numV)) * this.xunit;
    if (!isFinite(result)) return NaN;
    return Math.round(result * 100) / 100;
  };
  var Xinv = function(v) {
    return Number(v) / this.xunit - this.w + this.x1;
  };
  var Y = function(v) {
    const numV = typeof v === "string" ? parseFloat(v) : v;
    if (isNaN(numV)) return NaN;
    if (isNaN(this.y1) || isNaN(this.yunit)) return NaN;
    if (this.yunit <= 0) return NaN;
    const result = (this.y1 - numV) * this.yunit;
    if (!isFinite(result)) return NaN;
    return Math.round(result * 100) / 100;
  };
  var Yinv = function(v) {
    return this.y1 - Number(v) / this.yunit;
  };

  // ../latex2js/src/lib/text.ts
  var Expressions = {
    emph: /\\emph\{[^}]*\}/g,
    bf: /\{*\\bf [^}]*\}/g,
    rm: /\{*\\rm [^}]*\}/g,
    sl: /\{*\\sl [^}]*\}/g,
    it: /\{*\\it [^}]*\}/g,
    tt: /\{*\\tt [^}]*\}/g,
    mdash: /---/g,
    ndash: /--/g,
    openq: /``/g,
    closeq: /''/g,
    TeX: /\\TeX\\|\\TeX/g,
    LaTeX: /\\LaTeX\\|\\LaTeX/g,
    vspace: /\\vspace/g,
    cite: /\\cite\[\d+\]\{[^}]*\}/g,
    href: /\\href\{[^}]*\}\{[^}]*\}/g,
    img: /\\img\{[^}]*\}/g,
    set: /\\set\{[^}]*\}/g,
    youtube: /\\youtube\{[^}]*\}/g,
    euler: /Euler\^/g,
    textbf: /\\textbf\{[^}]*\}/g,
    textit: /\\textit\{[^}]*\}/g,
    texttt: /\\texttt\{[^}]*\}/g,
    textrm: /\\textrm\{[^}]*\}/g,
    textsc: /\\textsc\{[^}]*\}/g,
    underline: /\\underline\{[^}]*\}/g,
    overline: /\\overline\{[^}]*\}/g,
    section: /\\section\*?\{[^}]*\}/,
    subsection: /\\subsection\*?\{[^}]*\}/,
    subsubsection: /\\subsubsection\*?\{[^}]*\}/,
    paragraph: /\\paragraph\{[^}]*\}/,
    hspace: /\\hspace\{[^}]*\}/,
    noindent: /\\noindent/g,
    newpage: /\\newpage/g,
    hrule: /\\hrule/g,
    rule: /\\rule\{[^}]*\}\{[^}]*\}/g,
    textcolor: /\\textcolor\{[^}]*\}\{[^}]*\}/g,
    footnote: /\\footnote\{[^}]*\}/g
  };
  function heading(tag, level, m, parser) {
    const starred = m[1] === "*";
    const title = m[2];
    const number = !starred && parser && typeof parser.sectionNumber === "function" ? parser.sectionNumber(level, m[0]) : null;
    const label = number === null || number === void 0 ? "" : '<span class="section-number">' + number + "</span> ";
    return "<" + tag + ">" + label + title + "</" + tag + ">";
  }
  var Functions = {
    cite: function(m, contents) {
      m.forEach((match) => {
        var m2 = match.match(/\\cite\[(\d+)\]\{([^}]*)\}/);
        var m3 = location.pathname.match(/\/books\/(\d+)\//);
        var book_id = 0;
        if (m3) {
          book_id = parseInt(m3[1], 10);
        }
        contents = contents.replace(
          m2.input,
          '<a data-bypass="true" href="/references/' + book_id + "/" + m2[2] + '">[p' + m2[1] + "]</a>"
        );
      });
      return contents;
    },
    img: matchrepl(/\\img\{([^}]*)\}/, function(m) {
      return '<div style="width: 100%;text-align: center;"><img src="' + m[1] + '"></div>';
    }),
    youtube: matchrepl(/\\youtube\{([^}]*)\}/, function(m) {
      return '<div style="width: 100%;text-align: center;"><iframe width="560" height="315" src="https://www.youtube.com/embed/' + m[1] + '" frameborder="0" allowfullscreen></iframe></div>';
    }),
    href: matchrepl(/\\href\{([^}]*)\}\{([^}]*)\}/, function(m) {
      return '<a href="' + m[1] + '">' + m[2] + "</a>";
    }),
    set: matchrepl(/\\set\{([^}]*)\}/, function(m) {
      return "<i>" + m[1] + "</i>";
    }),
    euler: simplerepl(/Euler\^/, "exp"),
    emph: matchrepl(/\{([^}]*)\}/, function(m) {
      return "<i>" + m[1] + "</i>";
    }),
    bf: matchrepl(/\{*\\bf ([^}]*)\}/, function(m) {
      return "<b>" + m[1] + "</b>";
    }),
    rm: matchrepl(/\{*\\rm ([^}]*)\}/, function(m) {
      return '<span class="rm">' + m[1] + "</span>";
    }),
    sl: matchrepl(/\{*\\sl ([^}]*)\}/, function(m) {
      return "<i>" + m[1] + "</i>";
    }),
    it: matchrepl(/\{*\\it ([^}]*)\}/, function(m) {
      return "<i>" + m[1] + "</i>";
    }),
    tt: matchrepl(/\{*\\tt ([^}]*)\}/, function(m) {
      return '<span class="tt">' + m[1] + "</span>";
    }),
    ndash: simplerepl(/--/g, "&ndash;"),
    mdash: simplerepl(/---/g, "&mdash;"),
    openq: simplerepl(/``/g, "&ldquo;"),
    closeq: simplerepl(/''/g, "&rdquo;"),
    vspace: simplerepl(/\\vspace/g, "<br>"),
    TeX: simplerepl(/\\TeX\\|\\TeX/g, "$\\TeX$"),
    LaTeX: simplerepl(/\\LaTeX\\|\\LaTeX/g, "$\\LaTeX$"),
    textbf: matchrepl(/\\textbf\{([^}]*)\}/, function(m) {
      return "<b>" + m[1] + "</b>";
    }),
    textit: matchrepl(/\\textit\{([^}]*)\}/, function(m) {
      return "<i>" + m[1] + "</i>";
    }),
    texttt: matchrepl(/\\texttt\{([^}]*)\}/, function(m) {
      return '<span class="tt">' + m[1] + "</span>";
    }),
    textrm: matchrepl(/\\textrm\{([^}]*)\}/, function(m) {
      return '<span class="rm">' + m[1] + "</span>";
    }),
    textsc: matchrepl(/\\textsc\{([^}]*)\}/, function(m) {
      return '<span style="font-variant: small-caps;">' + m[1] + "</span>";
    }),
    underline: matchrepl(/\\underline\{([^}]*)\}/, function(m) {
      return "<u>" + m[1] + "</u>";
    }),
    overline: matchrepl(/\\overline\{([^}]*)\}/, function(m) {
      return '<span style="text-decoration: overline;">' + m[1] + "</span>";
    }),
    section: matchrepl(/\\section(\*?)\{([^}]*)\}/, function(m) {
      return heading("h2", "section", m, this);
    }),
    subsection: matchrepl(/\\subsection(\*?)\{([^}]*)\}/, function(m) {
      return heading("h3", "subsection", m, this);
    }),
    subsubsection: matchrepl(/\\subsubsection(\*?)\{([^}]*)\}/, function(m) {
      return heading("h4", "subsubsection", m, this);
    }),
    paragraph: matchrepl(/\\paragraph\{([^}]*)\}/, function(m) {
      return "<h5>" + m[1] + "</h5>";
    }),
    hspace: matchrepl(/\\hspace\{([^}]*)\}/, function(_m) {
      return "&nbsp; ";
    }),
    noindent: simplerepl(/\\noindent/g, ""),
    newpage: simplerepl(/\\newpage/g, "<br><br>"),
    hrule: simplerepl(/\\hrule/g, "<hr>"),
    rule: matchrepl(/\\rule\{([^}]*)\}\{([^}]*)\}/, function(m) {
      return '<span style="display:inline-block;width:' + m[1] + ";height:" + m[2] + ';background:currentColor;"></span>';
    }),
    textcolor: matchrepl(/\\textcolor\{([^}]*)\}\{([^}]*)\}/, function(m) {
      return '<span style="color:' + m[1] + ';">' + m[2] + "</span>";
    }),
    footnote: matchrepl(/\\footnote\{([^}]*)\}/, function(m) {
      return '<sup class="footnote">' + m[1] + "</sup>";
    })
  };
  var text_default = {
    Expressions,
    Functions
  };

  // ../latex2js/src/lib/headers.ts
  var Expressions2 = {
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
  function headed(title, name, parser, match) {
    const raw = Array.isArray(match) ? String(match[0] ?? "") : String(match ?? "");
    const number = parser && typeof parser.environmentNumber === "function" ? parser.environmentNumber(name, raw) : null;
    const label = number === null || number === void 0 ? "" : " " + number;
    return '<div class="theorem-env theorem-env--' + name + '"><h4 class="theorem-head">' + title + label + "</h4> ";
  }
  function closed() {
    return "</div>";
  }
  var Functions2 = {
    bq: () => '<p class="quotation">',
    claim(m) {
      return headed("Claim", "claim", this, m);
    },
    corollary(m) {
      return headed("Corollary", "corollary", this, m);
    },
    definition(m) {
      return headed("Definition", "definition", this, m);
    },
    lemma(m) {
      return headed("Lemma", "lemma", this, m);
    },
    proposition(m) {
      return headed("Proposition", "proposition", this, m);
    },
    axiom(m) {
      return headed("Axiom", "axiom", this, m);
    },
    remark(m) {
      return headed("Remark", "remark", this, m);
    },
    note(m) {
      return headed("Note", "note", this, m);
    },
    exercise(m) {
      return headed("Exercise", "exercise", this, m);
    },
    question(m) {
      return headed("Question", "question", this, m);
    },
    endclaim: () => closed(),
    endcorollary: () => closed(),
    enddefinition: () => closed(),
    endexample: () => closed(),
    endlemma: () => closed(),
    endproposition: () => closed(),
    endaxiom: () => closed(),
    endremark: () => closed(),
    endnote: () => closed(),
    endexercise: () => closed(),
    endquestion: () => closed(),
    endproblem: () => closed(),
    endsolution: () => closed(),
    endtheorem: () => closed(),
    eq: () => "</p>",
    example(m) {
      return headed("Example", "example", this, m);
    },
    problem(m) {
      return headed("Problem", "problem", this, m);
    },
    proof: () => '<div class="theorem-env theorem-env--proof"><h4 class="theorem-head">Proof</h4> ',
    // amsthm closes a proof with an open square. Emitted as a character rather
    // than as math: MathJax defines no \qed, so the previous `$\qed$` surfaced
    // an "Undefined control sequence" box at the end of every proof.
    qed: () => '<span class="qed">\u25A1</span></div>',
    solution(m) {
      return headed("Solution", "solution", this, m);
    },
    theorem(m) {
      return headed("Theorem", "theorem", this, m);
    }
  };
  var headers_default = {
    Expressions: Expressions2,
    Functions: Functions2
  };

  // ../settings/src/index.ts
  function normalizeDialect(value) {
    const v = String(value ?? "").trim().toLowerCase();
    if (v === "pstricks") return "pstricks";
    if (v === "latex2js" || v === "mathapedia") return "latex2js";
    return null;
  }
  var Expressions3 = {
    dialect: /^dialect$/,
    fillcolor: /^fillcolor$/,
    fillstyle: /^fillstyle$/,
    linecolor: /^linecolor$/,
    linestyle: /^linestyle$/,
    unit: /^unit/,
    runit: /^runit/,
    xunit: /^xunit/,
    yunit: /^yunit/
  };
  var Functions3 = {
    /**
     * Which language the document is written in.
     *
     * `pstricks` is the specification; `latex2js` (alias `mathapedia`) is this
     * project's superset — the interactive macros, infix plot bodies, natural-log
     * `log`, starred shapes honouring `fillcolor`. Declaring it is what makes the
     * extensions visible instead of indistinguishable from a bug.
     */
    dialect(o, v) {
      o.dialect = normalizeDialect(v);
    },
    fillcolor(o, v) {
      o.fillcolor = v;
    },
    fillstyle(o, v) {
      o.fillstyle = v;
    },
    linecolor(o, v) {
      o.linecolor = v;
    },
    linestyle(o, v) {
      o.linestyle = v;
    },
    unit(o, v) {
      const converted = convertUnits(v);
      o.unit = converted;
      o.runit = converted;
      o.xunit = converted;
      o.yunit = converted;
    },
    runit(o, v) {
      const converted = convertUnits(v);
      o.runit = converted;
    },
    xunit(o, v) {
      const converted = convertUnits(v);
      o.xunit = converted;
    },
    yunit(o, v) {
      const converted = convertUnits(v);
      o.yunit = converted;
    }
  };
  var src_default = {
    Expressions: Expressions3,
    Functions: Functions3
  };

  // ../pstricks/src/lib/pstricks.ts
  function radiusUnit(ctx) {
    const r = Number(ctx && ctx.runit);
    if (isFinite(r) && r > 0) return r;
    return Number(ctx && ctx.xunit);
  }
  function parseLinewidth(value) {
    const m = value.trim().match(/^([\d.]+)\s*(pt)?$/);
    if (!m) return 2;
    return Number(m[1]) * (m[2] ? 1.333 : 1);
  }
  function arcEndpoints(cx, cy, r, angleA, angleB) {
    const ox = cx === void 0 || cx === "" ? 0 : Number(cx);
    const oy = cy === void 0 || cy === "" ? 0 : Number(cy);
    const radius = Number(r);
    const at = (angle) => ({
      x: X.call(this, ox + radius * Math.cos(angle)),
      y: Y.call(this, oy + radius * Math.sin(angle))
    });
    return { A: at(angleA), B: at(angleB) };
  }
  var Expressions4 = {
    pspicture: /\\begin\{pspicture\}\(\s*(.*),(.*)\s*\)\(\s*(.*),(.*)\s*\)/,
    psframe: /\\psframe\*?(\[[^\]]*\])?\(\s*(.*),(.*)\s*\)\(\s*(.*),(.*)\s*\)/,
    psplot: /\\psplot\*?(\[[^\]]*\])?\{([^\}]*)\}\{([^\}]*)\}\{([^\}]*)\}/,
    psarc: new RegExp(
      "\\\\psarc\\*?" + RE.options + RE.type + RE.coords + RE.squiggle + RE.squiggle + RE.squiggle
    ),
    pscircle: /\\pscircle.*\(\s*(.*),(.*)\s*\)\{(.*)\}/,
    pspolygon: new RegExp("\\\\pspolygon\\*?" + RE.options + "(.*)"),
    psaxes: new RegExp(
      "\\\\psaxes\\*?" + RE.options + RE.type + RE.coords + RE.coordsOpt + RE.coordsOpt
    ),
    slider: new RegExp(
      "\\\\slider" + RE.options + RE.squiggle + RE.squiggle + RE.squiggle + RE.squiggle + RE.squiggle
    ),
    psline: new RegExp(
      "\\\\psline\\*?" + RE.options + RE.type + RE.coords + RE.coordsOpt + "((?:\\s*\\([^)]*\\))*)"
    ),
    userline: new RegExp(
      "\\\\userline" + RE.options + RE.type + RE.coords + RE.coords + RE.squiggleOpt + RE.squiggleOpt + RE.squiggleOpt + RE.squiggleOpt
    ),
    uservariable: new RegExp(
      "\\\\uservariable" + RE.options + RE.squiggle + RE.coords + RE.squiggle
    ),
    // The coordinates cannot contain a paren or the separating comma. They were
    // `(.*),(.*)`, which is greedy: on `\rput(1,-2){\pscircle(0,0){0.5}}` the x
    // capture ran to the comma inside the nested shape, so the placement read
    // its coordinates out of the contents.
    rput: /\\rput\(\s*([^,()]*),([^()]*?)\s*\)\s*\{([\s\S]*)\}/,
    psset: /\\psset\{(.*)\}/,
    psdots: new RegExp("\\\\psdots" + RE.options + "(.*)"),
    psgrid: new RegExp(
      "\\\\psgrid" + RE.options + RE.coordsOpt + RE.coordsOpt + RE.coordsOpt
    ),
    psellipse: /\\psellipse.*\(\s*(.*),(.*)\s*\)\(\s*(.*),(.*)\s*\)/,
    psbezier: /\\psbezier\*?(\[[^\]]*\])?\((.*),(.*)\)\((.*),(.*)\)\((.*),(.*)\)\((.*),(.*)\)/,
    pscurve: new RegExp("\\\\pscurve\\*?" + RE.options + RE.coords + "(.*)"),
    psecurve: new RegExp("\\\\psecurve\\*?" + RE.options + RE.coords + "(.*)"),
    psccurve: new RegExp("\\\\psccurve\\*?" + RE.options + RE.coords + "(.*)"),
    pswedge: /\\pswedge\*?(\[[^\]]*\])?\(\s*(.*),(.*)\s*\)\{(.*)\}\{(.*)\}\{(.*)\}/,
    pscustom: /\\pscustom\*?(\[[^\]]*\])?\{([\s\S]*)\}/,
    // The canonical \pscustom path vocabulary. Only meaningful inside one, and
    // inert elsewhere because psgraph has no renderer under these names.
    moveto: /\\moveto\(\s*([^,)]*),([^)]*)\s*\)/,
    lineto: /\\lineto\(\s*([^,)]*),([^)]*)\s*\)/,
    closepath: /\\closepath/,
    curveto: /\\curveto\(\s*([^,)]*),([^)]*)\s*\)\(\s*([^,)]*),([^)]*)\s*\)\(\s*([^,)]*),([^)]*)\s*\)/,
    multido: /\\multido\{([^}]*)\}\{([^}]*)\}\{([\s\S]*)\}/
  };
  var Functions4 = {
    slider(m) {
      var obj = {
        scalar: 1,
        min: Number(m[2]),
        max: Number(m[3]),
        variable: m[4],
        latex: m[5],
        value: Number(m[6])
      };
      this.variables = this.variables || {};
      this.variables[obj.variable] = obj.value;
      this.sliders = this.sliders || [];
      this.sliders.push(obj);
      if (m[1]) {
        Object.assign(obj, parseOptions(m[1]));
      }
      return obj;
    },
    pspicture(m) {
      var p = {
        x0: Number(m[1]),
        y0: Number(m[2]),
        x1: Number(m[3]),
        y1: Number(m[4])
      };
      var s = {
        w: p.x1 - p.x0,
        h: p.y1 - p.y0
      };
      Object.assign(this, p, s);
      return Object.assign(p, s);
    },
    psframe(m) {
      var obj = {
        x1: X.call(this, m[2]),
        y1: Y.call(this, m[3]),
        x2: X.call(this, m[4]),
        y2: Y.call(this, m[5]),
        linecolor: "black",
        linestyle: "solid",
        fillstyle: "none",
        fillcolor: "black",
        linewidth: 2,
        filled: /\\psframe\*/.test(m[0])
      };
      if (m[1]) Object.assign(obj, parseOptions(m[1]));
      return obj;
    },
    pscircle(m) {
      var obj = {
        cx: X.call(this, m[1]),
        cy: Y.call(this, m[2]),
        // A radius is a magnitude. PSTricks draws the same circle for a negative
        // one; SVG rejects it outright, so the shape vanished with a console error.
        r: Math.abs(radiusUnit(this) * Number(m[3])),
        linecolor: "black",
        linestyle: "solid",
        fillstyle: "none",
        fillcolor: "black",
        linewidth: 2,
        filled: /\\pscircle\*/.test(m[0])
      };
      var opts = m[0].match(/\[([^\]]*)\]/);
      if (opts) Object.assign(obj, parseOptions(opts[1]));
      return obj;
    },
    psaxes(m) {
      var obj = {
        dx: 1 * this.xunit,
        dy: 1 * this.yunit,
        arrows: [0, 0],
        dots: [0, 0],
        ticks: "all",
        labels: "all",
        showorigin: true
      };
      if (m[1]) {
        var options = parseOptions(m[1]);
        if (options.Dx) {
          obj.dx = Number(options.Dx) * this.xunit;
        }
        if (options.Dy) {
          obj.dy = Number(options.Dy) * this.yunit;
        }
        if (options.ticks) obj.ticks = options.ticks;
        if (options.labels) obj.labels = options.labels;
        if (options.arrowscale) obj.arrowscale = options.arrowscale;
        if (options.showorigin) obj.showorigin = options.showorigin !== "false";
      }
      var l = parseArrows(m[2]);
      obj.arrows = l.arrows;
      obj.dots = l.dots;
      if (m[1]) {
        const opts = parseOptions(m[1]);
        if (opts.arrows) {
          const fromOption = parseArrows(opts.arrows);
          obj.arrows = fromOption.arrows;
          obj.dots = fromOption.dots;
        }
      }
      if (m[5] && !m[8]) {
        obj.origin = [X.call(this, m[3]), Y.call(this, m[4])];
        obj.bottomLeft = [X.call(this, m[3]), Y.call(this, m[4])];
        obj.topRight = [X.call(this, m[6]), Y.call(this, m[7])];
      } else if (!m[5] && !m[8]) {
        obj.origin = [X.call(this, 0), Y.call(this, 0)];
        obj.bottomLeft = [X.call(this, 0), Y.call(this, 0)];
        obj.topRight = [X.call(this, m[3]), Y.call(this, m[6])];
      } else {
        obj.origin = [X.call(this, m[3]), Y.call(this, m[4])];
        obj.bottomLeft = [X.call(this, m[6]), Y.call(this, m[7])];
        obj.topRight = [X.call(this, m[9]), Y.call(this, m[10])];
      }
      return obj;
    },
    psplot(m) {
      var startX = evaluate.call(this, m[2]);
      var endX = evaluate.call(this, m[3]);
      var data = [];
      var x;
      var obj = {
        linecolor: "black",
        linestyle: "solid",
        fillstyle: "none",
        fillcolor: "none",
        linewidth: 2,
        // `plotstyle=dots` marks the samples rather than joining them; dotsize is
        // the marker radius, matching psdots so a document using both agrees.
        plotstyle: "line",
        dotsize: "2pt 2"
      };
      if (m[1]) Object.assign(obj, parseOptions(m[1]));
      var step = 5e-3;
      var plotpoints = obj.plotpoints ? Number(obj.plotpoints) : 0;
      if (plotpoints > 1) {
        step = (endX - startX) / (plotpoints - 1);
      } else if (obj.plotpoints !== void 0 && plotpoints < 2) {
        obj.plotpointsIgnored = plotpoints;
      }
      let compiled;
      try {
        compiled = parseExpression(m[4]);
      } catch (err) {
        console.warn("psplot: could not parse expression:", err.message);
        obj.data = data;
        return obj;
      }
      const scope = Object.assign({}, this.variables || {});
      for (x = startX; x <= endX + step / 2; x += step) {
        data.push(X.call(this, x));
        scope.x = x;
        const yValue = compiled.evaluate(scope);
        if (yValue !== void 0 && !isNaN(yValue)) {
          data.push(Y.call(this, yValue));
        } else {
          data.push(Y.call(this, 0));
        }
      }
      obj.data = data;
      normalizeArrows(obj);
      return obj;
    },
    pspolygon(m) {
      var coords = m[2];
      if (!coords) return;
      var manyCoords = new RegExp(RE.coords, "g");
      var matches = coords.match(manyCoords);
      var singleCoord = new RegExp(RE.coords);
      var data = [];
      matches.forEach((coord) => {
        var d = singleCoord.exec(coord);
        if (d) {
          data.push(X.call(this, d[1]));
          data.push(Y.call(this, d[2]));
        }
      });
      var obj = {
        linecolor: "black",
        linestyle: "solid",
        fillstyle: "none",
        fillcolor: "black",
        linewidth: 2,
        filled: /\\pspolygon\*/.test(m[0]),
        data
      };
      if (m[1]) Object.assign(obj, parseOptions(m[1]));
      return obj;
    },
    psarc(m) {
      var l = parseArrows(m[2]);
      var arrows = l.arrows;
      var dots = l.dots;
      var obj = {
        linecolor: "black",
        linestyle: "solid",
        // PSTricks leaves every shape unfilled unless a fillstyle is
        // given or the starred form is used; an unstarred \psarc is an open
        // curve, not a solid black wedge.
        fillstyle: "none",
        fillcolor: "black",
        linewidth: 2,
        arrows,
        dots,
        filled: /\\psarc\*/.test(m[0]),
        cx: X.call(this, 0),
        cy: Y.call(this, 0)
      };
      if (m[1]) {
        Object.assign(obj, parseOptions(m[1]));
      }
      if (m[3]) {
        obj.cx = X.call(this, m[3]);
      }
      if (m[4]) {
        obj.cy = Y.call(this, m[4]);
      }
      obj.r = Math.abs(Number(m[5]) * radiusUnit(this));
      obj.angleA = Number(m[6]) * Math.PI / 180;
      obj.angleB = Number(m[7]) * Math.PI / 180;
      Object.assign(obj, arcEndpoints.call(this, m[3], m[4], m[5], obj.angleA, obj.angleB));
      normalizeArrows(obj);
      return obj;
    },
    psline(m) {
      var options = m[1];
      var lineType = m[2];
      var l = parseArrows(lineType);
      var arrows = l.arrows;
      var dots = l.dots;
      var obj = {
        linecolor: "black",
        linestyle: "solid",
        fillstyle: "solid",
        fillcolor: "black",
        linewidth: 2,
        arrows,
        dots,
        filled: /\\psline\*/.test(m[0])
      };
      if (m[5]) {
        obj.x1 = X.call(this, m[3]);
        obj.y1 = Y.call(this, m[4]);
        obj.x2 = X.call(this, m[6]);
        obj.y2 = Y.call(this, m[7]);
      } else {
        obj.x1 = X.call(this, 0);
        obj.y1 = Y.call(this, 0);
        obj.x2 = X.call(this, m[3]);
        obj.y2 = Y.call(this, m[4]);
      }
      obj.points = [[obj.x1, obj.y1], [obj.x2, obj.y2]];
      const extra = m[8];
      if (extra) {
        for (const pair of String(extra).matchAll(/\(\s*([^,()]*),([^,()]*)\s*\)/g)) {
          obj.points.push([X.call(this, pair[1]), Y.call(this, pair[2])]);
        }
      }
      if (options) {
        Object.assign(obj, parseOptions(options));
      }
      if (typeof obj.linewidth === "string") {
        obj.linewidth = parseLinewidth(obj.linewidth);
      }
      normalizeArrows(obj);
      return obj;
    },
    uservariable(m) {
      var coords = [];
      if (this.userx && this.usery) {
        coords.push(Number(this.userx));
        coords.push(Number(this.usery));
      } else {
        coords.push(X.call(this, m[3]));
        coords.push(Y.call(this, m[4]));
      }
      var nx1 = Xinv.call(this, coords[0]);
      var ny1 = Yinv.call(this, coords[1]);
      var obj = {
        name: m[2],
        x: X.call(this, m[3]),
        y: Y.call(this, m[4]),
        func: m[5],
        value: 0
      };
      try {
        obj.value = parseExpression(m[5]).evaluate(
          Object.assign({ x: nx1, y: ny1 }, this.variables || {})
        );
      } catch (err) {
        console.warn("Error evaluating uservariable expression:", err.message);
      }
      return obj;
    },
    userline(m) {
      var options = m[1];
      var lineType = m[2];
      var l = parseArrows(lineType);
      var arrows = l.arrows;
      var dots = l.dots;
      const stripBraces = (s) => s ? s.replace(/^\{/, "").replace(/\}$/, "").trim() : null;
      const compileOpt = (src) => {
        if (!src) return null;
        try {
          return parseExpression(src);
        } catch (err) {
          console.warn("userline: could not parse expression:", err.message);
          return null;
        }
      };
      const xExp = compileOpt(stripBraces(m[7]));
      const yExp = compileOpt(stripBraces(m[8]));
      const xExp2 = compileOpt(stripBraces(m[9]));
      const yExp2 = compileOpt(stripBraces(m[10]));
      const variables = this.variables || {};
      const evalAt = (compiled, x, y) => compiled.evaluate(Object.assign({ x, y }, variables));
      var obj = {
        x1: X.call(this, m[3]),
        y1: Y.call(this, m[4]),
        x2: X.call(this, m[5]),
        y2: Y.call(this, m[6]),
        xExp: m[7],
        yExp: m[8],
        xExp2: m[9],
        yExp2: m[10],
        userx: (coords) => {
          var nx1 = Xinv.call(this, coords[0]);
          var ny1 = Yinv.call(this, coords[1]);
          try {
            return X.call(this, xExp ? evalAt(xExp, nx1, ny1) : 0);
          } catch (err) {
            console.warn("Error evaluating userx expression:", err);
            return X.call(this, 0);
          }
        },
        usery: (coords) => {
          var nx2 = Xinv.call(this, coords[0]);
          var ny2 = Yinv.call(this, coords[1]);
          try {
            return Y.call(this, yExp ? evalAt(yExp, nx2, ny2) : 0);
          } catch (err) {
            console.warn("Error evaluating usery expression:", err);
            return Y.call(this, 0);
          }
        },
        userx2: (coords) => {
          var nx3 = Xinv.call(this, coords[0]);
          var ny3 = Yinv.call(this, coords[1]);
          try {
            return X.call(this, xExp2 ? evalAt(xExp2, nx3, ny3) : 0);
          } catch (err) {
            console.warn("Error evaluating userx2 expression:", err);
            return X.call(this, 0);
          }
        },
        usery2: (coords) => {
          var nx4 = Xinv.call(this, coords[0]);
          var ny4 = Yinv.call(this, coords[1]);
          try {
            return Y.call(this, yExp2 ? evalAt(yExp2, nx4, ny4) : 0);
          } catch (err) {
            console.warn("Error evaluating usery2 expression:", err);
            return Y.call(this, 0);
          }
        },
        linecolor: "black",
        linestyle: "solid",
        fillstyle: "solid",
        fillcolor: "black",
        linewidth: 2,
        arrows,
        dots
      };
      if (options) {
        Object.assign(obj, parseOptions(options));
      }
      if (typeof obj.linewidth === "string") {
        obj.linewidth = parseLinewidth(obj.linewidth);
      }
      normalizeArrows(obj);
      return obj;
    },
    rput(m) {
      return {
        x: X.call(this, m[1]),
        y: Y.call(this, m[2]),
        text: m[3]
      };
    },
    /**
     * `\psset` declares defaults that every later command inherits.
     *
     * Every key is kept, not only the nine Settings knows about. Those nine need
     * conversion — units become numbers, the dialect is canonicalized — and the
     * rest are style defaults a shape reads in place of its own hardcoded one.
     * Dropping them is why `\psset{linewidth=2pt,linestyle=dashed}` drew a thin
     * solid line: the keys parsed, matched nothing, and were discarded.
     */
    psset(m) {
      const obj = {};
      if (!m || !m[1]) return obj;
      const declared = parseOptions(m[1]);
      Object.entries(declared).forEach(([key, value]) => {
        let converted = false;
        Object.keys(src_default.Expressions).forEach((setting) => {
          const exp = src_default.Expressions[setting];
          if (key.match(exp)) {
            src_default.Functions[setting](obj, value);
            converted = true;
          }
        });
        if (!converted) obj[key] = value;
      });
      return obj;
    },
    psdots(m) {
      var obj = {
        linecolor: "black",
        dotstyle: "dot",
        // PSTricks reads `dotsize=<dim> <factor>`: the diameter is
        // dim + factor x linewidth, so a thicker pen draws a bigger dot.
        dotsize: "2pt 2",
        linewidth: 0.8 * 1.333,
        data: parseCoordList.call(this, m[2])
      };
      if (m[1]) Object.assign(obj, parseOptions(m[1]));
      return obj;
    },
    psgrid(m) {
      var obj = {
        linecolor: "black",
        linestyle: "solid",
        linewidth: 0.5,
        // PSTricks grid defaults: a heavier line on the unit, five finer
        // subdivisions between, and the coordinate numbered along two edges.
        gridcolor: "black",
        gridwidth: "0.8pt",
        subgriddiv: 5,
        subgridcolor: "gray",
        subgridwidth: "0.4pt",
        gridlabelcolor: "black"
      };
      if (m[1]) Object.assign(obj, parseOptions(m[1]));
      var has0 = m[3] !== void 0;
      var has1 = m[6] !== void 0;
      var x0 = has0 ? X.call(this, m[3]) : X.call(this, this.x0);
      var y0 = has0 ? Y.call(this, m[4]) : Y.call(this, this.y0);
      var x1 = has1 ? X.call(this, m[6]) : X.call(this, this.x1);
      var y1 = has1 ? Y.call(this, m[7]) : Y.call(this, this.y1);
      obj.x0 = Math.min(x0, x1);
      obj.y0 = Math.min(y0, y1);
      obj.x1 = Math.max(x0, x1);
      obj.y1 = Math.max(y0, y1);
      obj.xunit = this.xunit;
      obj.yunit = this.yunit;
      obj.originX = X.call(this, 0);
      obj.originY = Y.call(this, 0);
      return obj;
    },
    psellipse(m) {
      var obj = {
        linecolor: "black",
        linestyle: "solid",
        fillstyle: "none",
        fillcolor: "black",
        linewidth: 2,
        filled: /\\psellipse\*/.test(m[0])
      };
      var opts = m[0].match(/\[([^\]]*)\]/);
      if (opts) Object.assign(obj, parseOptions(opts[1]));
      obj.cx = X.call(this, m[1]);
      obj.cy = Y.call(this, m[2]);
      obj.rx = Math.abs(Number(m[3])) * this.xunit;
      obj.ry = Math.abs(Number(m[4])) * this.yunit;
      return obj;
    },
    psbezier(m) {
      var obj = {
        linecolor: "black",
        linestyle: "solid",
        fillstyle: "none",
        fillcolor: "black",
        linewidth: 2,
        filled: /\\psbezier\*/.test(m[0])
      };
      if (m[1]) Object.assign(obj, parseOptions(m[1]));
      obj.x1 = X.call(this, m[2]);
      obj.y1 = Y.call(this, m[3]);
      obj.x2 = X.call(this, m[4]);
      obj.y2 = Y.call(this, m[5]);
      obj.x3 = X.call(this, m[6]);
      obj.y3 = Y.call(this, m[7]);
      obj.x4 = X.call(this, m[8]);
      obj.y4 = Y.call(this, m[9]);
      return obj;
    },
    pscurve(m) {
      var obj = {
        linecolor: "black",
        linestyle: "solid",
        fillstyle: "none",
        fillcolor: "black",
        linewidth: 2,
        filled: /\\ps[ce]?curve\*/.test(m[0]),
        // Only psccurve wraps. psecurve is an open curve whose first and last
        // points are tangent controls rather than points it passes through.
        closed: /\\psccurve/.test(m[0]),
        endpoints: /\\psecurve/.test(m[0])
      };
      if (m[1]) Object.assign(obj, parseOptions(m[1]));
      obj.data = [X.call(this, m[2]), Y.call(this, m[3])].concat(
        parseCoordList.call(this, m[4] || "")
      );
      return obj;
    },
    psecurve(m) {
      return Functions4.pscurve.call(this, m);
    },
    psccurve(m) {
      return Functions4.pscurve.call(this, m);
    },
    pswedge(m) {
      var obj = {
        linecolor: "black",
        linestyle: "solid",
        // PSTricks leaves every shape unfilled unless a fillstyle is
        // given or the starred form is used; an unstarred \psarc is an open
        // curve, not a solid black wedge.
        fillstyle: "none",
        fillcolor: "black",
        linewidth: 2,
        filled: /\\pswedge\*/.test(m[0])
      };
      if (m[1]) Object.assign(obj, parseOptions(m[1]));
      obj.cx = X.call(this, m[2]);
      obj.cy = Y.call(this, m[3]);
      obj.r = Math.abs(Number(m[4]) * radiusUnit(this));
      obj.angleA = Number(m[5]) * Math.PI / 180;
      obj.angleB = Number(m[6]) * Math.PI / 180;
      Object.assign(obj, arcEndpoints.call(this, m[2], m[3], m[4], obj.angleA, obj.angleB));
      return obj;
    },
    pscustom(m) {
      var obj = {
        linecolor: "black",
        linestyle: "solid",
        fillstyle: "none",
        fillcolor: "black",
        linewidth: 2,
        filled: /\\pscustom\*/.test(m[0]),
        body: m[2]
      };
      if (m[1]) Object.assign(obj, parseOptions(m[1]));
      return obj;
    },
    /** `\moveto(x,y)` — starts a new subpath inside \pscustom. */
    moveto(m) {
      return { x: X.call(this, m[1]), y: Y.call(this, m[2]) };
    },
    /** `\lineto(x,y)` — a straight segment inside \pscustom. */
    lineto(m) {
      return { x: X.call(this, m[1]), y: Y.call(this, m[2]) };
    },
    /** `\closepath` — closes the current subpath. */
    closepath() {
      return { close: true };
    },
    /** `\curveto(c1)(c2)(end)` — a cubic segment inside \pscustom. */
    curveto(m) {
      return {
        x1: X.call(this, m[1]),
        y1: Y.call(this, m[2]),
        x2: X.call(this, m[3]),
        y2: Y.call(this, m[4]),
        x: X.call(this, m[5]),
        y: Y.call(this, m[6])
      };
    },
    multido(m) {
      var spec = m[1] || "";
      var varMatch = spec.match(/\\([a-zA-Z@]+)\s*=\s*([\d.+-]+)\s*\+\s*([\d.+-]+)/);
      return {
        variable: varMatch ? varMatch[1] : null,
        start: varMatch ? Number(varMatch[2]) : 0,
        step: varMatch ? Number(varMatch[3]) : 1,
        count: Number(m[2]),
        body: m[3]
      };
    }
  };
  function parseCoordList(coords) {
    var data = [];
    var re = new RegExp(RE.coords, "g");
    var m;
    while ((m = re.exec(coords)) !== null) {
      data.push(X.call(this, m[1]));
      data.push(Y.call(this, m[2]));
    }
    return data;
  }
  var pstricks_default = {
    Expressions: Expressions4,
    Functions: Functions4
  };

  // ../pstricks/src/lib/psgraph.ts
  var MATHJAX_READY_TIMEOUT_MS = 1e4;
  function mathJaxWhenReady() {
    const usable = (mj) => mj && typeof mj.typesetPromise === "function" ? mj : null;
    const now = globalThis.MathJax;
    if (!now) return Promise.resolve(null);
    if (usable(now)) return Promise.resolve(now);
    return new Promise((resolve) => {
      const started = Date.now();
      const poll = () => {
        const ready = usable(globalThis.MathJax);
        if (ready) return resolve(ready);
        if (Date.now() - started >= MATHJAX_READY_TIMEOUT_MS) return resolve(null);
        setTimeout(poll, 50);
      };
      poll();
    });
  }
  function arrow(x1, y1, x2, y2, arrowscale) {
    var t = Math.PI / 6;
    var scale = Number(arrowscale);
    var d = 8 * (scale > 0 ? scale : 1);
    var dx = x2 - x1, dy = y2 - y1;
    var l = Math.sqrt(dx * dx + dy * dy);
    var cost = Math.cos(t);
    var sint = Math.sin(t);
    var dl = d / l;
    var x = x2 - (dx * cost - dy * sint) * dl;
    var y = y2 - (dy * cost + dx * sint) * dl;
    var context = [];
    context.push("M");
    context.push(x2);
    context.push(y2);
    context.push("L");
    context.push(x);
    context.push(y);
    cost = Math.cos(-t);
    sint = Math.sin(-t);
    x = x2 - (dx * cost - dy * sint) * dl;
    y = y2 - (dy * cost + dx * sint) * dl;
    context.push(x);
    context.push(y);
    context.push("Z");
    return context.join(" ");
  }
  var CURVATURE_DEFAULT = { a: 1, b: 0.1, c: 0 };
  function curveControls(prev, cur, next, p) {
    const d0x = cur[0] - prev[0];
    const d0y = cur[1] - prev[1];
    const d1x = next[0] - cur[0];
    const d1y = next[1] - cur[1];
    const l0 = Math.hypot(d0x, d0y);
    const l1 = Math.hypot(d1x, d1y);
    const w0 = Math.pow(l1, p.c);
    const w1 = Math.pow(l0, p.c);
    const tx = d0x * w0 + d1x * w1;
    const ty = d0y * w0 + d1y * w1;
    const tlen = Math.hypot(tx, ty);
    if (!tlen || !isFinite(tlen)) return { before: [...cur], after: [...cur] };
    const turn = Math.atan2(d0y, d0x) - Math.atan2(d1y, d1x);
    const m = p.a * Math.pow(Math.abs(Math.cos(turn / 2)), p.b) / tlen / 2;
    return {
      before: [cur[0] - l0 * tx * m, cur[1] - l0 * ty * m],
      after: [cur[0] + l1 * tx * m, cur[1] + l1 * ty * m]
    };
  }
  function curvatureParams(ctx) {
    const raw = String((ctx && ctx.curvature) ?? "").trim();
    const parts = raw ? raw.split(/[\s,]+/).map(Number) : [];
    const a = isFinite(parts[0]) ? parts[0] : CURVATURE_DEFAULT.a;
    const b = isFinite(parts[1]) ? parts[1] : CURVATURE_DEFAULT.b;
    const c = isFinite(parts[2]) ? parts[2] : CURVATURE_DEFAULT.c;
    return {
      a: a * 2 / 3 / Math.pow(Math.cos(Math.PI / 4), b),
      b,
      c: Math.min(3, Math.max(0, c + 1))
    };
  }
  function buildCurvePath(data, mode, ctx) {
    const pts = [];
    for (let i = 0; i < data.length; i += 2) pts.push([data[i], data[i + 1]]);
    const n = pts.length;
    const p = curvatureParams(ctx);
    const seg = (from, c1, c2, to) => " C " + c1[0] + " " + c1[1] + ", " + c2[0] + " " + c2[1] + ", " + to[0] + " " + to[1];
    if (mode === "closed") {
      if (n < 3) return "";
      const at = (i) => pts[(i % n + n) % n];
      const ctrl = pts.map((_, i) => curveControls(at(i - 1), at(i), at(i + 1), p));
      let d2 = "M " + pts[0][0] + " " + pts[0][1];
      for (let i = 0; i < n; i++) {
        d2 += seg(at(i), ctrl[i].after, ctrl[(i + 1) % n].before, at(i + 1));
      }
      return d2 + " Z";
    }
    if (mode === "endpoints") {
      if (n < 4) return "";
      let d2 = "M " + pts[1][0] + " " + pts[1][1];
      for (let i = 1; i < n - 2; i++) {
        const after = curveControls(pts[i - 1], pts[i], pts[i + 1], p).after;
        const before = curveControls(pts[i], pts[i + 1], pts[i + 2], p).before;
        d2 += seg(pts[i], after, before, pts[i + 1]);
      }
      return d2;
    }
    if (n < 3) return "";
    let d = "M " + pts[0][0] + " " + pts[0][1];
    for (let i = 0; i < n - 1; i++) {
      const after = i === 0 ? pts[0] : curveControls(pts[i - 1], pts[i], pts[i + 1], p).after;
      const before = i + 1 === n - 1 ? pts[n - 1] : curveControls(pts[i], pts[i + 1], pts[i + 2], p).before;
      d += seg(pts[i], after, before, pts[i + 1]);
    }
    return d;
  }
  var TAU = Math.PI * 2;
  var PT_TO_PX = 1.333;
  var HATCH_DIRECTIONS = {
    hlines: [0],
    vlines: [90],
    crosshatch: [0, 90]
  };
  var HATCH_DEFAULTS = { hatchwidth: 0.8, hatchsep: 4, hatchangle: 45, hatchcolor: "black" };
  var patternSeq = 0;
  function dimension(value, fallbackPt) {
    if (typeof value === "number" && isFinite(value)) return value * PT_TO_PX;
    const m = typeof value === "string" ? value.trim().match(/^([\d.]+)\s*(pt)?$/) : null;
    return (m ? Number(m[1]) : fallbackPt) * PT_TO_PX;
  }
  function hasFill(ctx) {
    return !!ctx.filled || !!ctx.fillstyle && ctx.fillstyle !== "none";
  }
  function resolveFill(ctx, svg) {
    const style = ctx.fillstyle ?? "none";
    if (ctx.filled || style === "solid") return ctx.fillcolor;
    if (style === "none" || !style) return "none";
    const starred = style.endsWith("*");
    const directions = HATCH_DIRECTIONS[starred ? style.slice(0, -1) : style];
    if (!directions) return "none";
    const sep = Math.max(1, dimension(ctx.hatchsep, HATCH_DEFAULTS.hatchsep));
    const width = Math.max(0.2, dimension(ctx.hatchwidth, HATCH_DEFAULTS.hatchwidth));
    const angle = Number(ctx.hatchangle ?? HATCH_DEFAULTS.hatchangle) || 0;
    const color = ctx.hatchcolor ?? HATCH_DEFAULTS.hatchcolor;
    const id = "l2j-hatch-" + ++patternSeq;
    const pattern = svg.append("svg:defs").append("svg:pattern").attr("id", id).attr("patternUnits", "userSpaceOnUse").attr("width", sep).attr("height", sep).attr("patternTransform", "rotate(" + -angle + ")");
    if (starred) {
      pattern.append("svg:rect").attr("width", sep).attr("height", sep).style("fill", ctx.fillcolor);
    }
    for (const d of directions) {
      const line = pattern.append("svg:line").style("stroke", color).style("stroke-width", width);
      if (d === 0) line.attr("x1", 0).attr("y1", sep / 2).attr("x2", sep).attr("y2", sep / 2);
      else line.attr("x1", sep / 2).attr("y1", 0).attr("x2", sep / 2).attr("y2", sep);
    }
    return "url(#" + id + ")";
  }
  function resolveStroke(ctx, fallback) {
    if (ctx && ctx.linestyle === "none") return "none";
    return ctx && ctx.linecolor || fallback || "black";
  }
  var DASH_DEFAULT = "5pt 3pt";
  var DOTSEP_DEFAULT = 3;
  var DOTSIZE_DEFAULT = "2pt 2";
  var DEFAULT_LINEWIDTH_PX = 0.8 * PT_TO_PX;
  function dashArray(ctx) {
    const style = ctx && ctx.linestyle || "solid";
    const round = (n) => Math.round(n * 1e3) / 1e3;
    if (style === "dotted") {
      const sep = dimension(ctx.dotsep, DOTSEP_DEFAULT);
      return "0," + round(sep + (Number(ctx.linewidth) || 0));
    }
    if (style !== "dashed") return "none";
    const parts = String(ctx.dash ?? DASH_DEFAULT).trim().split(/\s+/);
    const on = dimension(parts[0], 5);
    const off = dimension(parts[1] ?? parts[0], 3);
    return round(on) + "," + round(off);
  }
  function dashCap(ctx) {
    return ctx && ctx.linestyle === "dotted" ? "round" : "butt";
  }
  function dotRadius(ctx) {
    const parts = String(ctx.dotsize ?? DOTSIZE_DEFAULT).trim().split(/\s+/);
    const base = dimension(parts[0], 2);
    const factor = Number(parts[1]);
    const diameter = base + (isFinite(factor) ? factor : 0) * linewidthPx(ctx);
    return Math.max(0.1, diameter / 2);
  }
  function linewidthPx(ctx) {
    const v = ctx && ctx.linewidth;
    if (typeof v === "number" && isFinite(v)) return v;
    const m = typeof v === "string" ? v.trim().match(/^([\d.]+)\s*(pt)?$/) : null;
    if (!m) return DEFAULT_LINEWIDTH_PX;
    return Number(m[1]) * (m[2] ? PT_TO_PX : 1);
  }
  function drawable(ctx, depth = 0) {
    if (depth > 4 || ctx === null || ctx === void 0) return true;
    if (typeof ctx === "number") return isFinite(ctx);
    if (Array.isArray(ctx)) return ctx.every((v) => drawable(v, depth + 1));
    if (typeof ctx !== "object") return true;
    return Object.entries(ctx).every(
      // `global` is the shared environment, not this command's geometry.
      ([k, v]) => k === "global" || k === "env" || drawable(v, depth + 1)
    );
  }
  function arcFlags(angleA, angleB) {
    let raw = angleB - angleA;
    if (!isFinite(raw)) raw = 0;
    const full = Math.abs(raw) >= TAU - 1e-9;
    const delta = (raw % TAU + TAU) % TAU;
    return { delta, large: delta > Math.PI ? 1 : 0, sweep: 0, full };
  }
  function fullCirclePath(cx, cy, r) {
    return "M " + (cx - r) + " " + cy + " A " + r + " " + r + " 0 1 0 " + (cx + r) + " " + cy + " A " + r + " " + r + " 0 1 0 " + (cx - r) + " " + cy + " Z";
  }
  function curveRenderer(svg) {
    const mode = this.endpoints ? "endpoints" : this.closed ? "closed" : "open";
    const d = buildCurvePath(this.data, mode, this);
    if (!d) return;
    svg.append("svg:path").attr("d", d).style("stroke-width", this.linewidth).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this)).style("stroke-opacity", 1).style("fill", resolveFill(this, svg));
  }
  var SVG_NS = "http://www.w3.org/2000/svg";
  var PatchSelection = class _PatchSelection {
    constructor(node) {
      /** Number of appends this pass; public so the caller can prune by it. */
      this.slot = 0;
      this.node = node;
    }
    append(tagName) {
      const node = this.node;
      if (!node) return new _PatchSelection(null);
      const tag = tagName.startsWith("svg:") ? tagName.slice(4) : tagName;
      const existing = node.children[this.slot];
      let child;
      if (existing && existing.localName === tag) {
        child = existing;
      } else {
        child = document.createElementNS(SVG_NS, tag);
        if (existing) node.replaceChild(child, existing);
        else node.appendChild(child);
      }
      this.slot++;
      return new _PatchSelection(child);
    }
    attr(name, value) {
      if (this.node) {
        const v = String(value);
        if (this.node.getAttribute(name) !== v) this.node.setAttribute(name, v);
      }
      return this;
    }
    style(name, value) {
      if (this.node instanceof SVGElement) {
        const v = String(value);
        const styles = this.node.style;
        if (styles[name] !== v) styles[name] = v;
      }
      return this;
    }
    text(content) {
      if (this.node && this.node.textContent !== content) this.node.textContent = content;
      return this;
    }
    /** Removes children past the last slot written this pass. */
    prune() {
      const node = this.node;
      if (!node) return;
      while (node.children.length > this.slot) {
        node.removeChild(node.children[node.children.length - 1]);
      }
    }
  };
  var psgraph = {
    env: null,
    getSize() {
      const padding = 20;
      this.env.scale = 1;
      const goalWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - padding;
      if (goalWidth <= this.env.w * this.env.xunit) {
        this.env.scale = goalWidth / this.env.w / this.env.xunit;
      }
      const width = this.env.w * this.env.xunit;
      const height = this.env.h * this.env.yunit;
      return {
        width,
        height
      };
    },
    psframe(svg) {
      const filled = hasFill(this);
      if (filled) {
        svg.append("svg:rect").attr("x", Math.min(this.x1, this.x2)).attr("y", Math.min(this.y1, this.y2)).attr("width", Math.abs(this.x2 - this.x1)).attr("height", Math.abs(this.y2 - this.y1)).style("fill", resolveFill(this, svg)).style("stroke", "none");
      }
      svg.append("svg:line").attr("x1", this.x1).attr("y1", this.y1).attr("x2", this.x2).attr("y2", this.y1).style("stroke-width", 2).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this)).style("stroke-opacity", 1);
      svg.append("svg:line").attr("x1", this.x2).attr("y1", this.y1).attr("x2", this.x2).attr("y2", this.y2).style("stroke-width", 2).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this)).style("stroke-opacity", 1);
      svg.append("svg:line").attr("x1", this.x2).attr("y1", this.y2).attr("x2", this.x1).attr("y2", this.y2).style("stroke-width", 2).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this)).style("stroke-opacity", 1);
      svg.append("svg:line").attr("x1", this.x1).attr("y1", this.y2).attr("x2", this.x1).attr("y2", this.y1).style("stroke-width", 2).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this)).style("stroke-opacity", 1);
    },
    pscircle: function(svg) {
      const filled = hasFill(this);
      svg.append("svg:circle").attr("cx", this.cx).attr("cy", this.cy).attr("r", this.r).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this)).style("fill", resolveFill(this, svg)).style("stroke-width", this.linewidth).style("stroke-opacity", 1);
    },
    psplot(svg) {
      if (this.plotstyle === "dots") {
        for (let i = 0; i < this.data.length; i += 2) {
          svg.append("svg:circle").attr("cx", this.data[i]).attr("cy", this.data[i + 1]).attr("r", dotRadius(this)).attr("class", "psplot").style("fill", this.linecolor).style("stroke", "none");
        }
        return;
      }
      var context = [];
      context.push("M");
      if (hasFill(this)) {
        context.push(this.data[0]);
        context.push(Y.call(this.global, 0));
      } else {
        context.push(this.data[0]);
        context.push(this.data[1]);
      }
      context.push("L");
      this.data.forEach((data) => {
        context.push(data);
      });
      if (hasFill(this)) {
        context.push(this.data[this.data.length - 2]);
        context.push(Y.call(this.global, 0));
        context.push("Z");
      }
      svg.append("svg:path").attr("d", context.join(" ")).attr("class", "psplot").style("stroke-width", this.linewidth).style("stroke-opacity", 1).style("fill", resolveFill(this, svg)).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this));
    },
    pspolygon(svg) {
      var context = [];
      context.push("M");
      context.push(this.data[0]);
      context.push(this.data[1]);
      context.push("L");
      this.data.forEach((data) => {
        context.push(data);
      });
      context.push("Z");
      svg.append("svg:path").attr("d", context.join(" ")).style("stroke-width", this.linewidth).style("stroke-opacity", 1).style("fill", resolveFill(this, svg)).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this));
    },
    psarc(svg) {
      const { delta, large, sweep, full } = arcFlags(this.angleA, this.angleB);
      const filled = hasFill(this);
      const arc = " A " + this.r + " " + this.r + " 0 " + large + " " + sweep + " " + this.B.x + " " + this.B.y;
      const d = full || delta === 0 ? fullCirclePath(this.cx, this.cy, this.r) : filled ? "M " + this.cx + " " + this.cy + " L " + this.A.x + " " + this.A.y + arc + " Z" : "M " + this.A.x + " " + this.A.y + arc;
      svg.append("svg:path").attr("d", d).style("stroke-width", this.linewidth).style("stroke-opacity", 1).style("fill", resolveFill(this, svg)).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this));
    },
    psaxes(svg) {
      var xaxis = [this.bottomLeft[0], this.topRight[0]];
      var yaxis = [this.bottomLeft[1], this.topRight[1]];
      var origin = this.origin;
      const axisStroke = resolveStroke(this);
      function line(x1, y1, x2, y2) {
        svg.append("svg:path").attr("d", "M " + x1 + " " + y1 + " L " + x2 + " " + y2).style("stroke-width", 2).style("stroke", axisStroke).style("stroke-opacity", 1);
      }
      const arrowedEnds = (axis) => [
        this.arrows[0] ? axis[0] : null,
        this.arrows[1] ? axis[1] : null
      ];
      const positions = (from, to, at, step) => {
        if (!(step > 0) || !isFinite(step)) return [];
        const lo = Math.min(from, to);
        const hi = Math.max(from, to);
        const out = [];
        for (let v = at; v <= hi + 1e-6; v += step) out.push(v);
        for (let v = at - step; v >= lo - 1e-6; v -= step) out.unshift(v);
        const suppressed = arrowedEnds([from, to]).filter((v) => v !== null);
        return out.filter((v) => !suppressed.some((end) => Math.abs(v - end) < 1e-6));
      };
      var xticks = () => {
        positions(xaxis[0], xaxis[1], origin[0], this.dx).forEach((x) => {
          if (this.showorigin === false && Math.abs(x - origin[0]) < 1e-6) return;
          line(x, origin[1] - 5, x, origin[1] + 5);
        });
      };
      var yticks = () => {
        positions(yaxis[0], yaxis[1], origin[1], this.dy).forEach((y) => {
          if (this.showorigin === false && Math.abs(y - origin[1]) < 1e-6) return;
          line(origin[0] - 5, y, origin[0] + 5, y);
        });
      };
      const env = this.global || {};
      const label = (text, x, y, anchor) => {
        svg.append("svg:text").attr("x", x).attr("y", y).attr("text-anchor", anchor).attr("font-size", 13).attr("font-family", "serif").style("fill", "black").text(text);
      };
      const value = (device, axis) => {
        const n = axis === "x" ? device / env.xunit - env.w + env.x1 : env.y1 - device / env.yunit;
        return Math.abs(n) < 1e-9 ? 0 : Number(n.toFixed(4));
      };
      const xlabels = () => {
        positions(xaxis[0], xaxis[1], origin[0], this.dx).forEach((x) => {
          const atOrigin = Math.abs(x - origin[0]) < 1e-6;
          if (atOrigin && this.showorigin === false) return;
          if (atOrigin) label(String(value(x, "x")), x - 7, origin[1] + 20, "end");
          else label(String(value(x, "x")), x, origin[1] + 20, "middle");
        });
      };
      const ylabels = () => {
        positions(yaxis[0], yaxis[1], origin[1], this.dy).forEach((y) => {
          if (Math.abs(y - origin[1]) < 1e-6) return;
          label(String(value(y, "y")), origin[0] - 10, y + 4, "end");
        });
      };
      line(xaxis[0], origin[1], xaxis[1], origin[1]);
      line(origin[0], yaxis[0], origin[0], yaxis[1]);
      const selects = (option, axis) => {
        const v = String(option ?? "all");
        if (v.match(/none/)) return false;
        return !!(v.match(/all/) || v.match(axis));
      };
      if (selects(this.ticks, "x")) xticks();
      if (selects(this.ticks, "y")) yticks();
      if (env.xunit && selects(this.labels, "x")) xlabels();
      if (env.yunit && selects(this.labels, "y")) ylabels();
      if (this.arrows[0]) {
        svg.append("path").attr("d", arrow(xaxis[1], origin[1], xaxis[0], origin[1], this.arrowscale)).style("fill", "black").style("stroke", "black");
        svg.append("path").attr("d", arrow(origin[0], yaxis[1], origin[0], yaxis[0], this.arrowscale)).style("fill", "black").style("stroke", "black");
      }
      if (this.arrows[1]) {
        svg.append("path").attr("d", arrow(xaxis[0], origin[1], xaxis[1], origin[1], this.arrowscale)).style("fill", "black").style("stroke", "black");
        svg.append("path").attr("d", arrow(origin[0], yaxis[0], origin[0], yaxis[1], this.arrowscale)).style("fill", "black").style("stroke", "black");
      }
    },
    psline(svg) {
      var linewidth = this.linewidth, linecolor = resolveStroke(this);
      const dash = dashArray(this);
      const cap = dashCap(this);
      function draw(x1, y1, x2, y2) {
        svg.append("svg:path").attr("d", "M " + x1 + " " + y1 + " L " + x2 + " " + y2).style("stroke-width", linewidth).style("stroke", linecolor).style("stroke-dasharray", dash).style("stroke-linecap", cap).style("stroke-opacity", 1);
      }
      const pts = this.points && this.points.length >= 2 ? this.points : [[this.x1, this.y1], [this.x2, this.y2]];
      for (let i = 0; i < pts.length - 1; i++) {
        draw(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
      }
      const marker = (at) => {
        svg.append("svg:circle").attr("cx", at[0]).attr("cy", at[1]).attr("r", dotRadius(this)).style("stroke", resolveStroke(this)).style("fill", this.linecolor).style("stroke-width", 1).style("stroke-opacity", 1);
      };
      if (this.dots[0]) marker(pts[0]);
      if (this.dots[1]) marker(pts[pts.length - 1]);
      const head = pts[pts.length - 1];
      const beforeHead = pts[pts.length - 2];
      const tail = pts[0];
      const afterTail = pts[1];
      if (this.arrows[0]) {
        svg.append("path").attr("d", arrow(afterTail[0], afterTail[1], tail[0], tail[1], this.arrowscale)).style("fill", this.linecolor).style("stroke", resolveStroke(this));
      }
      if (this.arrows[1]) {
        svg.append("path").attr("d", arrow(beforeHead[0], beforeHead[1], head[0], head[1], this.arrowscale)).style("fill", this.linecolor).style("stroke", resolveStroke(this));
      }
    },
    userline(svg) {
      var linewidth = this.linewidth, linecolor = resolveStroke(this);
      const dash = dashArray(this);
      const cap = dashCap(this);
      function draw(x12, y12, x22, y22) {
        svg.append("svg:path").attr("class", "userline").attr("d", "M " + x12 + " " + y12 + " L " + x22 + " " + y22).style("stroke-width", linewidth).style("stroke", linecolor).style("stroke-dasharray", dash).style("stroke-linecap", cap).style("stroke-opacity", 1);
      }
      const pts = this.points && this.points.length >= 2 ? this.points : [[this.x1, this.y1], [this.x2, this.y2]];
      for (let i = 0; i < pts.length - 1; i++) {
        draw(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
      }
      if (this.dots[0]) {
        svg.append("svg:circle").attr("cx", this.x1).attr("cy", this.y1).attr("r", 3).attr("class", "userline").style("stroke", resolveStroke(this)).style("fill", this.linecolor).style("stroke-width", 1).style("stroke-opacity", 1);
      }
      if (this.dots[1]) {
        svg.append("svg:circle").attr("cx", this.x2).attr("cy", this.y2).attr("r", 3).attr("class", "userline").style("stroke", resolveStroke(this)).style("fill", this.linecolor).style("stroke-width", 1).style("stroke-opacity", 1);
      }
      var x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2;
      if (this.arrows[0]) {
        svg.append("path").attr("d", arrow(x2, y2, x1, y1, this.arrowscale)).attr("class", "userline").style("fill", this.linecolor).style("stroke", resolveStroke(this));
      }
      if (this.arrows[1]) {
        svg.append("path").attr("d", arrow(x1, y1, x2, y2, this.arrowscale)).attr("class", "userline").style("fill", this.linecolor).style("stroke", resolveStroke(this));
      }
    },
    /**
     * Graphics placed by an `\rput`, drawn into a translated group.
     *
     * The label form of rput is handled separately, in the DOM pass below. This
     * is the case where the contents are shapes: they are drawn here so they
     * keep their place in document order, which the DOM pass cannot express
     * because it appends after the SVG is finished.
     */
    rputgroup(svg) {
      const g = svg.append("svg:g").attr("class", "rput-group").attr("transform", "translate(" + this.dx + "," + this.dy + ")");
      (this.children || []).forEach((child) => {
        if (!child || !psgraph.hasOwnProperty(child.key)) return;
        if (!drawable(child.data)) return;
        child.data.global = this.global;
        psgraph[child.key].call(child.data, g);
      });
    },
    rput(el) {
      const startTime = Date.now();
      const x = this.x;
      const y = this.y;
      if (typeof x !== "number" || typeof y !== "number" || isNaN(x) || isNaN(y)) {
        console.warn("RPUT: Invalid coordinates detected", { x, y, text: this.text });
        return;
      }
      if (!el || !el.appendChild) {
        console.warn("RPUT: Invalid parent container provided");
        return;
      }
      if (!this.text || typeof this.text !== "string") {
        console.warn("RPUT: Invalid text content", { text: this.text });
        return;
      }
      const div = document.createElement("div");
      div.className = "math";
      div.style.position = "absolute";
      div.style.visibility = "hidden";
      div.style.whiteSpace = "nowrap";
      div.style.top = `${y}px`;
      div.style.left = `${x}px`;
      div.style.pointerEvents = "none";
      div.setAttribute("data-rput-x", x.toString());
      div.setAttribute("data-rput-y", y.toString());
      div.setAttribute("data-rput-text", this.text);
      const positionElement = () => {
        return new Promise((resolve) => {
          requestAnimationFrame(() => {
            try {
              const rect = div.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) {
                console.warn("RPUT: Element has zero dimensions, retrying...", {
                  text: this.text,
                  rect: { width: rect.width, height: rect.height }
                });
                setTimeout(() => {
                  const retryRect = div.getBoundingClientRect();
                  const w = retryRect.width / 2;
                  const h = retryRect.height / 2;
                  div.style.top = `${y - (h || 10)}px`;
                  div.style.left = `${x - (w || 20)}px`;
                  div.style.visibility = "visible";
                  div.style.pointerEvents = "auto";
                  resolve();
                }, 10);
                return;
              }
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              div.style.top = `${y - centerY}px`;
              div.style.left = `${x - centerX}px`;
              div.style.visibility = "visible";
              div.style.pointerEvents = "auto";
              resolve();
            } catch (error) {
              console.error("RPUT: Error during positioning", error);
              div.style.top = `${y}px`;
              div.style.left = `${x}px`;
              div.style.visibility = "visible";
              div.style.pointerEvents = "auto";
              resolve();
            }
          });
        });
      };
      const processContent = async () => {
        const mathJax = await mathJaxWhenReady();
        if (mathJax && mathJax.typesetPromise) {
          try {
            div.innerHTML = this.text;
            await mathJax.typesetPromise([div]);
            await new Promise((resolve) => setTimeout(resolve, 0));
            await positionElement();
          } catch (error) {
            console.error("MathJax typesetting failed:", error);
            div.innerHTML = this.text;
            await positionElement();
          }
        } else {
          div.innerHTML = this.text;
          await positionElement();
        }
      };
      if (el.isConnected === false) {
        console.warn("RPUT: Parent container not connected to DOM");
      }
      el.appendChild(div);
      processContent().catch((error) => {
        console.error("RPUT: Failed to process content", error);
        div.style.visibility = "visible";
        div.style.pointerEvents = "auto";
      });
    },
    pspicture(svg) {
      var env = this.env;
      var el = this.$el;
      const plots = this.plot;
      const elements = env && env.elements;
      function resolveDynamic(item, coords, variables) {
        if (item.name === "psplot") {
          Object.entries(variables || {}).forEach(([name, value]) => {
            env.variables[name] = value;
          });
          const d = item.fn.call(env, item.match);
          d.global = Object.assign({}, env);
          return d;
        }
        if (item.name === "userline") {
          if (!coords) return item.data;
          const d = item.fn.call(env, item.match);
          env.x2 = coords[0];
          env.y2 = coords[1];
          item.data.x2 = env.x2;
          item.data.y2 = env.y2;
          if (item.data.xExp2) {
            item.data.x2 = d.userx2(coords);
            item.data.x1 = d.userx(coords);
          } else if (item.data.xExp) {
            item.data.x2 = d.userx(coords);
          }
          if (item.data.yExp2) {
            item.data.y2 = d.usery2(coords);
            item.data.y1 = d.usery(coords);
          } else if (item.data.yExp) {
            item.data.y2 = d.usery(coords);
          }
          d.global = Object.assign({}, env);
          Object.assign(d, item.data);
          return d;
        }
        return item.data;
      }
      function resolveData(item, coords, variables) {
        if (!coords || !item.fn) return item.data;
        return resolveDynamic(item, coords, variables);
      }
      function readVariables(coords) {
        const variables = {};
        const source = elements && elements.length ? elements.filter((i) => i && i.name === "uservariable") : (plots && plots.uservariable || []).map((p) => ({ ...p, name: "uservariable" }));
        source.forEach((item) => {
          env.userx = coords[0];
          env.usery = coords[1];
          const dd = item.fn.call(env, item.match);
          variables[item.data.name] = dd.value;
        });
        return variables;
      }
      function expressionVariables(expr) {
        const src = String(expr).replace(/^\{/, "").replace(/\}$/, "");
        try {
          return parseExpression(src).variables().filter((n) => n !== "x" && n !== "y");
        } catch {
          return [];
        }
      }
      const depsCache = /* @__PURE__ */ new Map();
      function depsFor(item) {
        const cached = depsCache.get(item);
        if (cached) return cached;
        const data = item && item.data;
        const vars = /* @__PURE__ */ new Set();
        let pointer = false;
        if (data) {
          pointer = Object.values(data).some((v) => typeof v === "function");
          for (const k of ["func", "xExp", "yExp", "xExp2", "yExp2"]) {
            const expr = data[k];
            if (typeof expr === "string" && expr) {
              expressionVariables(expr).forEach((n) => vars.add(n));
            }
          }
        }
        if (item && item.match) {
          for (const g of [2, 3, 4]) {
            const expr = item.match[g];
            if (typeof expr === "string" && expr) {
              expressionVariables(expr).forEach((n) => vars.add(n));
            }
          }
        }
        const deps = { pointer, variables: [...vars] };
        depsCache.set(item, deps);
        return deps;
      }
      let layer = null;
      let layerNode = null;
      const groups = /* @__PURE__ */ new Map();
      const drawn = /* @__PURE__ */ new Set();
      let lastCoords = null;
      let lastVariables = {};
      function clearLayer() {
        if (layer) layer.remove();
        groups.clear();
        drawn.clear();
        layer = svg.append("svg:g").attr("class", "pspicture-layer");
        layerNode = layer.node();
      }
      function drawLayer(coords, opts) {
        opts = opts || {};
        if (!elements || !elements.length) {
          clearLayer();
          const variables2 = coords ? readVariables(coords) : {};
          Object.keys(plots).forEach((key) => {
            if (key === "rput") return;
            if (!psgraph.hasOwnProperty(key)) return;
            plots[key].forEach((entry) => {
              const item = { name: key, data: entry.data, match: entry.match, fn: entry.fn };
              const data = resolveData(item, coords, variables2);
              data.global = env;
              psgraph[key].call(data, layer);
            });
          });
          return;
        }
        if (opts.force) clearLayer();
        if (!layerNode) clearLayer();
        const variables = coords ? readVariables(coords) : {};
        const changed = new Set(opts.changed || []);
        if (coords) {
          Object.entries(variables).forEach(([name, value]) => {
            if (!(name in lastVariables) || lastVariables[name] !== value) changed.add(name);
          });
          lastVariables = variables;
          lastCoords = coords;
        }
        const pointerMoved = !!coords && !!opts.pointer;
        let prevGroup = null;
        const touched = /* @__PURE__ */ new Set();
        for (let i = 0; i < elements.length; i++) {
          const item = elements[i];
          if (!item || !item.name || item.name === "rput") continue;
          if (!psgraph.hasOwnProperty(item.name)) continue;
          touched.add(item);
          const deps = depsFor(item);
          const needs = opts.force || !drawn.has(item) || deps.pointer && pointerMoved || deps.variables.some((n) => changed.has(n));
          const key = (g) => {
            if (g.getAttribute("data-key") !== String(i)) g.setAttribute("data-key", String(i));
          };
          if (!needs) {
            const group2 = groups.get(item);
            if (group2) {
              key(group2);
              prevGroup = group2;
            }
            continue;
          }
          let data;
          if (coords || opts.force) {
            data = resolveData(item, coords, variables);
          } else if (item.name === "psplot") {
            data = resolveDynamic(item, coords, variables);
          } else {
            data = item.data;
          }
          if (!drawable(data)) {
            const stale = groups.get(item);
            if (stale) {
              stale.remove();
              groups.delete(item);
            }
            drawn.delete(item);
            continue;
          }
          let group = groups.get(item);
          if (!group) {
            group = document.createElementNS(SVG_NS, "g");
            group.setAttribute("data-key", String(i));
            if (prevGroup && prevGroup.nextSibling) {
              layerNode.insertBefore(group, prevGroup.nextSibling);
            } else {
              layerNode.appendChild(group);
            }
            groups.set(item, group);
          } else {
            key(group);
          }
          prevGroup = group;
          data.global = env;
          const sel = new PatchSelection(group);
          psgraph[item.name].call(data, sel);
          if (sel.slot === 0) {
            while (group.firstChild) group.removeChild(group.firstChild);
            drawn.delete(item);
          } else {
            sel.prune();
            drawn.add(item);
          }
        }
        groups.forEach((group, item) => {
          if (!touched.has(item)) {
            group.remove();
            groups.delete(item);
            drawn.delete(item);
          }
        });
      }
      drawLayer(null, { force: true });
      this.redraw = (arg) => {
        if (Array.isArray(arg) || arg === null || arg === void 0) {
          drawLayer(arg === void 0 ? lastCoords : arg, { pointer: true });
        } else {
          drawLayer(arg.coords !== void 0 ? arg.coords : lastCoords, arg);
        }
      };
      svg.on(
        "touchmove",
        function(event) {
          event.preventDefault();
          var touch = event.touches ? event.touches[0] : null;
          var rect = event.target.getBoundingClientRect();
          var touchcoords = touch ? [touch.clientX - rect.left, touch.clientY - rect.top] : [0, 0];
          drawLayer(touchcoords, { pointer: true });
        }
      );
      svg.on(
        "mousemove",
        function(event) {
          var coords = [event.offsetX || 0, event.offsetY || 0];
          drawLayer(coords, { pointer: true });
        }
      );
      psgraph.processRputElements.call(this, el);
    },
    psdots(svg) {
      for (let i = 0; i < this.data.length; i += 2) {
        svg.append("svg:circle").attr("cx", this.data[i]).attr("cy", this.data[i + 1]).attr("r", dotRadius(this)).style("fill", this.linecolor).style("stroke", "none");
      }
    },
    /**
     * A PSTricks grid is three things, not one: fine subdivision lines, a heavier
     * line on each unit, and the coordinate numbered along the left and bottom
     * edges. Only the unit lines were drawn, in `linecolor` — which `gridcolor`
     * could not override — so a grid was a flat mesh with no reading on it.
     */
    psgrid(svg) {
      const x0 = this.x0, y0 = this.y0, x1 = this.x1, y1 = this.y1;
      const gridcolor = this.gridcolor ?? this.linecolor;
      const gridwidth = dimension(this.gridwidth, 0.8);
      const subdiv = Math.max(0, Math.floor(Number(this.subgriddiv ?? 5)));
      const subcolor = this.subgridcolor ?? "gray";
      const subwidth = dimension(this.subgridwidth, 0.4);
      const rule = (a, b, c, d, color, width) => {
        svg.append("svg:line").attr("x1", a).attr("y1", b).attr("x2", c).attr("y2", d).style("stroke", color).style("stroke-width", width).style("stroke-opacity", 1);
      };
      const rungs = (lo, hi, origin, step) => {
        if (!(step > 0) || !isFinite(step)) return [];
        const out = [];
        for (let v = origin; v <= hi + 1e-6; v += step) out.push(v);
        for (let v = origin - step; v >= lo - 1e-6; v -= step) out.unshift(v);
        return out;
      };
      const ox = this.originX ?? x0;
      const oy = this.originY ?? y0;
      if (subdiv > 1) {
        for (const x of rungs(x0, x1, ox, this.xunit / subdiv)) rule(x, y0, x, y1, subcolor, subwidth);
        for (const y of rungs(y0, y1, oy, this.yunit / subdiv)) rule(x0, y, x1, y, subcolor, subwidth);
      }
      const xs = rungs(x0, x1, ox, this.xunit);
      const ys = rungs(y0, y1, oy, this.yunit);
      for (const x of xs) rule(x, y0, x, y1, gridcolor, gridwidth);
      for (const y of ys) rule(x0, y, x1, y, gridcolor, gridwidth);
      const labels = this.gridlabels ?? 10;
      if (labels === "none" || Number(labels) === 0) return;
      const size = dimension(labels, 10);
      const labelcolor = this.gridlabelcolor ?? "black";
      const text = (s, x, y, anchor) => {
        svg.append("svg:text").attr("x", x).attr("y", y).attr("text-anchor", anchor).attr("font-size", size).attr("font-family", "serif").style("fill", labelcolor).text(s);
      };
      const round = (n) => Math.abs(n) < 1e-9 ? 0 : Number(n.toFixed(4));
      const env = this.global || {};
      const belowY = Math.min(y1 + size + 4, (env.h ?? 0) * (env.yunit ?? 1) - 2);
      const leftX = Math.max(x0 - 4, size);
      for (const x of xs) text(String(round(x / env.xunit - env.w + env.x1)), x, belowY, "middle");
      for (const y of ys) text(String(round(env.y1 - y / env.yunit)), leftX, y + size / 3, "end");
    },
    psellipse(svg) {
      svg.append("svg:ellipse").attr("cx", this.cx).attr("cy", this.cy).attr("rx", this.rx).attr("ry", this.ry).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this)).style("stroke-width", this.linewidth).style("stroke-opacity", 1).style("fill", resolveFill(this, svg));
    },
    psbezier(svg) {
      const d = "M " + this.x1 + " " + this.y1 + " C " + this.x2 + " " + this.y2 + ", " + this.x3 + " " + this.y3 + ", " + this.x4 + " " + this.y4;
      svg.append("svg:path").attr("d", d).style("stroke-width", this.linewidth).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this)).style("stroke-opacity", 1).style("fill", resolveFill(this, svg));
    },
    pscurve(svg) {
      const d = buildCurvePath(this.data, this.endpoints ? "endpoints" : this.closed ? "closed" : "open", this);
      if (!d) return;
      svg.append("svg:path").attr("d", d).style("stroke-width", this.linewidth).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this)).style("stroke-opacity", 1).style("fill", resolveFill(this, svg));
    },
    psecurve: curveRenderer,
    psccurve: curveRenderer,
    pswedge(svg) {
      const { delta, large, sweep, full } = arcFlags(this.angleA, this.angleB);
      const d = full || delta === 0 ? fullCirclePath(this.cx, this.cy, this.r) : "M " + this.cx + " " + this.cy + " L " + this.A.x + " " + this.A.y + " A " + this.r + " " + this.r + " 0 " + large + " " + sweep + " " + this.B.x + " " + this.B.y + " Z";
      svg.append("svg:path").attr("d", d).style("stroke-width", this.linewidth).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this)).style("stroke-opacity", 1).style("fill", resolveFill(this, svg));
    },
    pscustom(svg) {
      const filled = hasFill(this);
      let d = "";
      let started = false;
      (this.commands || []).forEach((cmd) => {
        const data = cmd.data;
        if (!data) return;
        if (cmd.key === "moveto") {
          d += " M " + data.x + " " + data.y;
          started = true;
          return;
        }
        if (cmd.key === "lineto") {
          if (!started) {
            d += "M " + data.x + " " + data.y;
            started = true;
            return;
          }
          d += " L " + data.x + " " + data.y;
          return;
        }
        if (cmd.key === "curveto") {
          if (!started) {
            d += "M " + data.x1 + " " + data.y1;
            started = true;
          }
          d += " C " + data.x1 + " " + data.y1 + ", " + data.x2 + " " + data.y2 + ", " + data.x + " " + data.y;
          return;
        }
        if (cmd.key === "closepath") {
          if (started) d += " Z";
          return;
        }
        if (cmd.key === "psline" || cmd.key === "userline" || cmd.key === "psbezier") {
          if (cmd.key === "psbezier") {
            if (!started) {
              d += "M " + data.x1 + " " + data.y1;
              started = true;
            }
            d += " C " + data.x2 + " " + data.y2 + ", " + data.x3 + " " + data.y3 + ", " + data.x4 + " " + data.y4;
            return;
          }
          const pts = data.points && data.points.length >= 2 ? data.points : [[data.x1, data.y1], [data.x2, data.y2]];
          let from = 0;
          if (!started) {
            d += "M " + pts[0][0] + " " + pts[0][1];
            started = true;
            from = 1;
          }
          for (let i = from; i < pts.length; i++) d += " L " + pts[i][0] + " " + pts[i][1];
        } else if (cmd.key === "psframe") {
          if (!started) {
            d += "M " + data.x1 + " " + data.y1;
            started = true;
          }
          d += " L " + data.x2 + " " + data.y1 + " L " + data.x2 + " " + data.y2 + " L " + data.x1 + " " + data.y2 + " Z";
        } else if (cmd.key === "pspolygon" || cmd.key === "pscurve") {
          const pts = data.data || [];
          if (pts.length < 2) return;
          if (!started) {
            d += "M " + pts[0] + " " + pts[1];
            started = true;
          }
          for (let i = 2; i < pts.length; i += 2) d += " L " + pts[i] + " " + pts[i + 1];
          d += " Z";
        }
      });
      if (!started) return;
      if (filled) d += " Z";
      svg.append("svg:path").attr("d", d).style("stroke-width", this.linewidth).style("stroke", resolveStroke(this)).style("stroke-dasharray", dashArray(this)).style("stroke-linecap", dashCap(this)).style("stroke-opacity", 1).style("fill", resolveFill(this, svg));
    },
    processRputElements(el) {
      if (!el || typeof el.querySelectorAll !== "function") {
        console.warn("RPUT: Invalid container for RPUT processing");
        return;
      }
      if (!this.plot || !Array.isArray(this.plot.rput)) {
        console.warn("RPUT: No RPUT data to process");
        return;
      }
      try {
        const existingElements = el.querySelectorAll(".math[data-rput-x]");
        let cleanupCount = 0;
        existingElements.forEach((element) => {
          try {
            element.style.visibility = "hidden";
            element.remove();
            cleanupCount++;
          } catch (error) {
            console.warn("RPUT: Error removing existing element", error);
          }
        });
        if (cleanupCount > 0) {
          console.log(`RPUT: Cleaned up ${cleanupCount} existing elements`);
        }
        requestAnimationFrame(() => {
          psgraph.renderRputElements.call(this, el);
        });
      } catch (error) {
        console.error("RPUT: Error during cleanup", error);
        psgraph.renderRputElements.call(this, el);
      }
    },
    renderRputElements(el) {
      if (!this.plot?.rput || this.plot.rput.length === 0) {
        return;
      }
      console.log(`RPUT: Rendering ${this.plot.rput.length} elements`);
      const renderPromises = [];
      this.plot.rput.forEach((rput, index) => {
        try {
          if (!rput || !rput.data) {
            console.warn(`RPUT: Invalid RPUT data at index ${index}`, rput);
            return;
          }
          rput.data.global = this.env;
          const renderPromise = new Promise((resolve) => {
            try {
              setTimeout(() => {
                psgraph.rput.call(rput.data, el);
                resolve();
              }, index * 10);
            } catch (error) {
              console.error(`RPUT: Error rendering element ${index}`, error);
              resolve();
            }
          });
          renderPromises.push(renderPromise);
        } catch (error) {
          console.error(`RPUT: Error processing element ${index}`, error);
        }
      });
      Promise.all(renderPromises).then(() => {
        console.log("RPUT: All elements rendered successfully");
      }).catch((error) => {
        console.error("RPUT: Error in batch rendering", error);
      });
    }
  };
  var psgraph_default = psgraph;

  // ../latex2js/src/lib/environments.ts
  var environments = ["pspicture", "verbatim", "enumerate", "print", "nicebox", "itemize", "description"];
  var environments_default = environments;

  // ../latex2js/src/lib/ignore.ts
  var ignore = [
    /^\%/,
    /\\begin\{document\}/,
    /\\end\{document\}/,
    /\\begin\{interactive\}/,
    /\\end\{interactive\}/,
    /\\usepackage/,
    /\\documentclass/,
    /\\tableofcontents/,
    /\\author/,
    /\\date/,
    /\\maketitle/,
    /\\title/,
    /\\pagestyle/,
    /\\smallskip/,
    /\\medskip/,
    /\\bigskip/,
    /\\nobreak/,
    /\\begin\{center\}/,
    /\\end\{center\}/
  ];
  var ignore_default = ignore;

  // ../latex2js/src/lib/parser.ts
  var pegParser = __toESM(require_parser());

  // ../latex2js/src/lib/dialect.ts
  var CSS_ONLY_COLORS = ["lightblue", "lightgray", "lightgrey", "lightgreen", "darkblue", "darkgreen", "pink", "gold", "silver", "navy", "teal", "lime", "aqua", "fuchsia"];
  var LATEX2JS_ONLY_COMMANDS = {
    userline: "draws a line the reader can drag; PSTricks has no interactive graphics",
    uservariable: "binds a value to the pointer position; PSTricks has no such binding",
    slider: "renders a control the reader can move; PSTricks has no such control"
  };
  function dialectUses(name, raw, options) {
    const uses = [];
    const only = LATEX2JS_ONLY_COMMANDS[name];
    if (only) uses.push({ construct: `\\${name}`, detail: only });
    const bare = /\[([^\]]*)\]/.exec(raw);
    if (bare) {
      for (const part of bare[1].split(",")) {
        const token = part.trim();
        if (token && !token.includes("=")) {
          uses.push({
            construct: "bare option flag",
            detail: `\`${token}\` has no value; PSTricks requires \`${token}=true\``
          });
        }
      }
    }
    if (options) {
      for (const key of ["linecolor", "fillcolor", "hatchcolor", "gridcolor"]) {
        const value = String(options[key] ?? "").trim().toLowerCase();
        if (CSS_ONLY_COLORS.indexOf(value) !== -1) {
          uses.push({
            construct: "CSS colour name",
            detail: `\`${value}\` is a browser colour; xcolor does not define it`
          });
        }
      }
      if (options.plotpoints !== void 0 && Number(options.plotpoints) === 1) {
        uses.push({
          construct: "plotpoints=1",
          detail: "PSTricks requires at least 2 samples"
        });
      }
    }
    if (name === "psplot") uses.push(...plotBodyUses(raw, options));
    return uses;
  }
  function plotBodyUses(raw, options) {
    const uses = [];
    const groups = raw.match(/\{([^{}]*)\}/g) || [];
    const bodies = groups.map((g) => g.slice(1, -1));
    const declaredAlgebraic = String(options?.algebraic ?? "").toLowerCase() === "true";
    if (!declaredAlgebraic) {
      uses.push({
        construct: "infix plot body",
        detail: "read as an infix expression; PSTricks reads RPN PostScript unless algebraic=true"
      });
    }
    const body = bodies[bodies.length - 1] ?? "";
    if (/\bpow\s*\(/.test(body)) {
      uses.push({ construct: "pow()", detail: "PSTricks has no pow function, only the ^ operator" });
    }
    if (/\blog\s*\(/.test(body)) {
      uses.push({ construct: "log()", detail: "natural log here, base 10 in PSTricks" });
    }
    for (const bound of bodies.slice(0, -1)) {
      if (bound.trim() && !/^-?[\d.]+$/.test(bound.trim())) {
        uses.push({
          construct: "variable plot bound",
          detail: `\`${bound.trim()}\` is an expression; PSTricks needs a literal number`
        });
      }
    }
    return uses;
  }

  // ../latex2js/src/lib/counters.ts
  var SECTION_LEVELS = ["section", "subsection", "subsubsection"];
  var Counters = class {
    constructor() {
      this.sections = SECTION_LEVELS.map(() => 0);
      this.environments = {};
    }
    /** Starts a fresh document. */
    reset() {
      this.sections = SECTION_LEVELS.map(() => 0);
      this.environments = {};
    }
    /**
     * Advances a sectioning level and returns its number.
     *
     * Deeper levels reset, so a new section restarts subsection numbering. A
     * subsection appearing before any section reports `0.1`, which is what LaTeX
     * does rather than an error — the document is odd, not broken.
     *
     * @param level - which sectioning level is starting
     * @returns the dotted number, such as `2.3`
     */
    section(level) {
      const depth = SECTION_LEVELS.indexOf(level);
      this.sections[depth] += 1;
      for (let i = depth + 1; i < this.sections.length; i++) this.sections[i] = 0;
      return this.sections.slice(0, depth + 1).join(".");
    }
    /**
     * Advances the counter for a theorem-like environment and returns its number.
     *
     * Each kind counts independently — Theorem 1 and Lemma 1 can both exist —
     * which is what a plain `\newtheorem{name}{Name}` declaration gives.
     *
     * @param name - the environment name, such as `theorem`
     * @returns the next number for that kind
     */
    environment(name) {
      this.environments[name] = (this.environments[name] ?? 0) + 1;
      return this.environments[name];
    }
  };

  // ../latex2js/src/lib/parser.ts
  var PSSET_NON_STYLE = /* @__PURE__ */ new Set(["unit", "runit", "xunit", "yunit", "dialect"]);
  var DEFINECOLOR_RE = /\\definecolor\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}/;
  function pssetStyle(declared) {
    const style = {};
    for (const [key, value] of Object.entries(declared || {})) {
      if (PSSET_NON_STYLE.has(key)) continue;
      if (value === void 0) continue;
      style[key] = value;
    }
    return style;
  }
  function applyPsset(data, style, raw) {
    if (!data || !style) return;
    const bracket = typeof raw === "string" ? raw.match(/\[([^\]]*)\]/) : null;
    const inline = bracket ? bracket[1].split(",").map((p) => p.split("=")[0].trim()) : [];
    for (const [key, value] of Object.entries(style)) {
      if (inline.indexOf(key) !== -1) continue;
      data[key] = value;
    }
  }
  function envForUnits(env, units) {
    if (!env || !units) return env;
    const xunit = Number(units.xunit);
    const yunit = Number(units.yunit);
    const sameX = !isFinite(xunit) || xunit === env.xunit;
    const sameY = !isFinite(yunit) || yunit === env.yunit;
    const sameR = !isFinite(Number(units.runit)) || Number(units.runit) === env.runit;
    if (sameX && sameY && sameR) return env;
    const scaled = { ...env };
    const runit = Number(units.runit);
    if (isFinite(runit) && runit > 0) scaled.runit = runit;
    if (!sameX && xunit > 0) {
      const originX = (env.w - env.x1) * env.xunit;
      scaled.xunit = xunit;
      scaled.w = originX / xunit + env.x1;
    }
    if (!sameY && yunit > 0) {
      const originY = env.y1 * env.yunit;
      scaled.yunit = yunit;
      scaled.y1 = originY / yunit;
    }
    return scaled;
  }
  function braceGroup(raw) {
    if (typeof raw !== "string") return "";
    const start = raw.indexOf("{");
    if (start === -1) return "";
    let depth = 0;
    for (let i = start; i < raw.length; i++) {
      if (raw[i] === "{") depth++;
      else if (raw[i] === "}" && --depth === 0) return raw.slice(start + 1, i);
    }
    return "";
  }
  function nonFiniteFields(value, path = "", depth = 0) {
    if (depth > 4 || value === null || value === void 0) return [];
    if (typeof value === "number") return isFinite(value) ? [] : [path || "value"];
    if (Array.isArray(value)) {
      return value.flatMap(
        (v, i) => typeof v === "number" && !isFinite(v) ? [`${path}[${i}]`] : nonFiniteFields(v, `${path}[${i}]`, depth + 1)
      );
    }
    if (typeof value !== "object") return [];
    return Object.entries(value).filter(([k]) => k !== "global" && k !== "env").flatMap(([k, v]) => nonFiniteFields(v, path ? `${path}.${k}` : k, depth + 1));
  }
  var Parser2 = class {
    constructor(LaTeX2JS) {
      /**
       * True after walking a command or environment node: neither consumes the
       * newline that ends the source line it closes on, so the next empty Line
       * node is that EOL — not a blank line — and must not become a paragraph
       * break.
       */
      this.pendingEol = false;
      this.Ignore = LaTeX2JS.Ignore;
      this.Delimiters = LaTeX2JS.Delimiters;
      this.Text = LaTeX2JS.Text;
      this.PSTricks = LaTeX2JS.PSTricks;
      this.Headers = LaTeX2JS.Headers;
      this.objects = [];
      this.environment = null;
      this.settings = this.PSTricks.Functions.psset.call(this, [
        "",
        "units=1cm,linecolor=black,linestyle=solid,fillstyle=none"
      ]);
      this.style = pssetStyle(this.settings);
      this.diagnostics = [];
      this.dialect = normalizeDialect(LaTeX2JS.dialect) ?? "pstricks";
      this.counters = new Counters();
    }
    /**
     * The number a sectioning command should carry, or null when it is starred.
     *
     * Text transforms call this through their receiver, so the registry stays
     * free of parser internals and a third-party transform that does not care
     * about numbering keeps working.
     *
     * @param level - which sectioning level is starting
     * @param raw - the command's source, so a starred form can opt out
     * @returns the dotted number, or null for an unnumbered heading
     */
    sectionNumber(level, raw) {
      if (/\\[a-z]+\*/.test(raw)) return null;
      return this.counters.section(level);
    }
    /**
     * The number a theorem-like environment should carry, or null when starred.
     *
     * @param name - the environment name, such as `theorem`
     * @param raw - the `\begin` source, so a starred form can opt out
     * @returns the next number for that kind, or null when unnumbered
     */
    environmentNumber(name, raw) {
      if (/\{[a-z]+\*\}/.test(raw)) return null;
      return this.counters.environment(name);
    }
    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------
    parse(text) {
      this.diagnostics = [];
      this.counters.reset();
      resetDefinedColors();
      if (!text) return [];
      const tree = this.parseTree(text);
      this.walk(tree);
      this.objects.forEach((obj) => {
        if (obj.type.match(/pspicture/)) {
          obj.plot = this.parsePSTricks(obj.commands || [], obj.env);
          delete obj.commands;
        }
      });
      return this.objects;
    }
    // -------------------------------------------------------------------------
    // Grammar integration
    // -------------------------------------------------------------------------
    parseTree(text) {
      try {
        return pegParser.parse(text);
      } catch (err) {
        const loc = err.location || { start: { line: 1, column: 1 } };
        this.diagnostics.push({
          severity: "error",
          message: `parse error: ${err.message || String(err)}`,
          line: loc.start.line,
          column: loc.start.column
        });
        return [{ kind: "raw", text }];
      }
    }
    // -------------------------------------------------------------------------
    // Tree walk
    // -------------------------------------------------------------------------
    walk(segments) {
      this.objects = [];
      this.environment = { type: "math", lines: [] };
      this.pendingEol = false;
      segments.forEach((seg) => this.walkSegment(seg));
      this.newEnvironment("math");
    }
    walkSegment(seg) {
      if (seg.kind === "raw") {
        seg.text.split("\n").forEach((line) => this.pushMathLine(line));
        return;
      }
      switch (seg.kind) {
        case "line":
          this.walkContent(seg);
          break;
        case "env":
          this.walkEnv(seg);
          break;
        case "strayEnd":
          if (this.isIgnored(seg.raw)) return;
          this.diagnose("warning", `unexpected \\end{${seg.name}}`, seg.loc);
          break;
      }
    }
    walkEnv(env) {
      const name = env.name;
      if (this.isIgnoredEnv(name)) {
        env.content.forEach((c) => this.walkContent(c));
        return;
      }
      const structural = env.verbatim || !!this.Delimiters[name];
      if (!structural) {
        const inPspicture = this.inPspicture();
        if (inPspicture) this.pushLine(env.begin.raw);
        else this.pushMathLine(env.begin.raw);
        this.pendingEol = true;
        env.content.forEach((c) => this.walkContent(c));
        if (env.end) {
          if (inPspicture) this.pushLine(env.end.raw);
          else this.pushMathLine(env.end.raw);
          this.pendingEol = true;
        } else {
          this.diagnose("warning", `unclosed \\begin{${name}}`, env.begin.loc);
        }
        return;
      }
      this.newEnvironment(name);
      if (!env.verbatim) this.metaData(name, env);
      if (env.verbatim) {
        const v = env.content[0];
        this.environment.lines = v && v.kind === "verbatim" ? v.text.split("\n") : [];
      } else if (name.match(/pspicture/)) {
        this.environment.commands = [];
        env.content.forEach((c) => this.walkContent(c));
      } else {
        this.walkTextContent(env.content);
      }
      if (env.end && env.end.name !== name) {
        this.diagnose(
          "warning",
          `\\end{${env.end.name}} does not match \\begin{${name}}`,
          env.end.loc
        );
      } else if (!env.end) {
        this.diagnose("warning", `unclosed environment '${name}'`, env.begin.loc);
      }
      this.newEnvironment("math");
    }
    /**
     * Walk a text environment's content, rejoining the nodes that came from one
     * source line.
     *
     * `EnvContent` matches `Command` before `Line`, and a command's tail stops at
     * the next command, so `\item First with \textbf{bold} text` arrives as two
     * command nodes. Walking them individually renders each as its own line,
     * which broke every list item at its first macro. pspicture keeps the
     * per-node walk, because it depends on receiving commands separately.
     */
    walkTextContent(content) {
      let pending = [];
      const flush = () => {
        if (!pending.length) return;
        const text = pending.map((n) => n.kind === "line" ? this.lineToString(n) : n.raw).join("");
        pending = [];
        this.pushMathLine(text);
      };
      content.forEach((node) => {
        if (node.kind === "env") {
          flush();
          this.walkEnv(node);
          this.pendingEol = true;
          return;
        }
        if (node.kind === "line" && node.parts.length === 0) {
          if (this.pendingEol && !pending.length) {
            this.pendingEol = false;
            return;
          }
          if (pending.length) flush();
          else this.pushBlankLine(false);
          return;
        }
        this.pendingEol = false;
        const at = node.loc && node.loc.line;
        const open = pending.length ? pending[0].loc && pending[0].loc.line : at;
        if (pending.length && at !== open) flush();
        pending.push(node);
        if (node.kind === "line") flush();
      });
      flush();
    }
    /**
     * Walk one node of environment content. Behavior depends on the current
     * environment: inside pspicture we collect commands (and raw lines) for plot
     * extraction; elsewhere lines go through the text/header passes.
     */
    walkContent(node) {
      const inPspicture = this.inPspicture();
      switch (node.kind) {
        case "line": {
          const allComments = node.parts.length > 0 && node.parts.every((p) => p.kind === "comment");
          if (allComments) return;
          if (node.parts.length === 0) {
            if (this.pendingEol) {
              this.pendingEol = false;
              return;
            }
            this.pushBlankLine(inPspicture);
            return;
          }
          this.pendingEol = false;
          const text = this.lineToString(node);
          if (inPspicture) this.pushLine(text);
          else this.pushMathLine(text);
          break;
        }
        case "command": {
          if (node.name === "psset") {
            this.parseUnits(node.raw);
            return;
          }
          if (inPspicture) {
            node.settings = { ...this.style };
            node.units = {
              xunit: this.settings.xunit,
              yunit: this.settings.yunit,
              runit: this.settings.runit
            };
            this.environment.commands.push(node);
          } else {
            this.pushMathLine(node.raw);
            this.pendingEol = true;
          }
          break;
        }
        case "env":
          this.walkEnv(node);
          this.pendingEol = true;
          break;
        default:
          break;
      }
    }
    /**
     * Convert a Line node's parts back to a string, dropping comment fragments.
     */
    lineToString(line) {
      return line.parts.filter((p) => p.kind !== "comment").map((p) => p.kind === "char" ? p.c : p.raw).join("");
    }
    // -------------------------------------------------------------------------
    // Line handling
    // -------------------------------------------------------------------------
    inPspicture() {
      return !!(this.environment && this.environment.type.match(/pspicture/));
    }
    pushBlankLine(inPspicture) {
      if (inPspicture) return;
      if (this.inPspicture()) return;
      this.environment.lines.push("<br>");
    }
    pushMathLine(text) {
      if (this.isIgnored(text)) return;
      if (!text.trim().length) {
        this.environment.lines.push("<br>");
        return;
      }
      if (this.PSTricks.Expressions.psset.test(text)) {
        this.parseUnits(text);
        return;
      }
      if (DEFINECOLOR_RE.test(text)) {
        this.parseDefineColor(text);
        return;
      }
      const processed = this.parseText(text);
      if (processed.trim().length) this.environment.lines.push(processed);
    }
    /** Raw line inside a pspicture: no text/header transforms (they corrupt
     *  PSTricks content). */
    pushLine(line) {
      var add = true;
      this.Ignore.forEach((exp) => {
        if (exp.test(line)) {
          add = false;
        }
      });
      if (add && typeof line === "string" && line.trim().length) {
        if (this.PSTricks.Expressions.psset.test(line)) {
          this.parseUnits(line);
        } else if (DEFINECOLOR_RE.test(line)) {
          this.parseDefineColor(line);
        } else {
          this.environment.lines.push(line);
        }
      }
    }
    isIgnored(line) {
      return this.Ignore.some((exp) => exp.test(line));
    }
    isIgnoredEnv(name) {
      return this.isIgnored("\\begin{" + name + "}");
    }
    /**
     * Groups lines into paragraphs, the way TeX does.
     *
     * TeX has no concept of a blank line as vertical space: a run of them, of
     * any length, is a single `\par`, and the gap between paragraphs comes from
     * `\parskip` — a style, set once for the document, not something an author
     * dials in by pressing return more times. Two blank lines and one are the
     * same input.
     *
     * This used to emit one `<br>` per blank line, so the gap was however many
     * times the author happened to hit return, and no stylesheet could adjust
     * it. Paragraphs are real elements now and the spacing is theirs, which is
     * both what TeX means and the only version a theme can restyle.
     *
     * Block elements are passed through untouched: a heading, list or picture is
     * not part of a paragraph and brings its own margins.
     *
     * @param lines - the environment's rendered lines
     * @returns the lines with runs of text wrapped in paragraphs
     */
    paragraphize(lines) {
      const isBlock = (l) => /^\s*<(h[1-6]|ul|ol|li|p|div|table|blockquote|pre|figure)\b/i.test(l);
      const mathEnvBegin = /\\begin\{(align\*?|alignat\*?|equation\*?|eqnarray\*?|gather\*?|multline\*?)\}/;
      const out = [];
      let para = [];
      let mathEnv = null;
      let mathEnvName = "";
      const flush = () => {
        if (!para.length) return;
        out.push('<p class="para">' + para.join("\n") + "</p>");
        para = [];
      };
      for (const line of lines) {
        if (mathEnv) {
          if (line !== "<br>") mathEnv.push(line);
          if (line.includes("\\end{" + mathEnvName + "}")) {
            out.push(mathEnv.join("\n"));
            mathEnv = null;
          }
          continue;
        }
        const begin = line.match(mathEnvBegin);
        if (begin && !line.includes("\\end{" + begin[1] + "}")) {
          flush();
          mathEnvName = begin[1];
          mathEnv = [line];
          continue;
        }
        if (line === "<br>") {
          flush();
          continue;
        }
        if (isBlock(line)) {
          flush();
          out.push(line);
          continue;
        }
        para.push(line);
      }
      if (mathEnv) out.push(mathEnv.join("\n"));
      flush();
      return out;
    }
    newEnvironment(type) {
      if (this.environment && (this.environment.lines.length || this.environment.type !== "math")) {
        this.environment.settings = { ...this.settings };
        if (this.environment.type === "math") {
          this.environment.lines = this.paragraphize(this.environment.lines);
        }
        this.objects.push(this.environment);
      }
      this.environment = {
        type,
        lines: []
      };
    }
    /**
     * Records a `\definecolor{name}{model}{spec}`.
     *
     * xcolor lets a document define its own colours, and a document that wants a
     * shade xcolor does not name — a browser colour such as `lightblue`, say —
     * can define it rather than rely on the renderer guessing. That is what makes
     * such a page valid LaTeX instead of only valid here.
     */
    parseDefineColor(text, loc) {
      const m = String(text || "").match(DEFINECOLOR_RE);
      if (!m) return;
      if (!defineColor(m[1], m[2], m[3])) {
        this.diagnose(
          "warning",
          `\\definecolor{${m[1]}}: the ${JSON.stringify(m[2])} model with ${JSON.stringify(m[3])} is not one this understands; the colour is left undefined`,
          loc
        );
      }
    }
    parseUnits(line) {
      var m = line.replace(/\n/g, " ").match(this.PSTricks.Expressions.psset);
      const declared = this.PSTricks.Functions.psset.call(this, m);
      if (declared.dialect) this.dialect = declared.dialect;
      Object.assign(this.settings, declared);
      Object.assign(this.style, pssetStyle(declared));
    }
    metaData(environment, envNode) {
      if (this.PSTricks.Expressions.hasOwnProperty(environment)) {
        this.environment.match = envNode.begin.raw.replace(/\n/g, " ").match(this.PSTricks.Expressions[environment]);
        if (!this.environment.match) {
          this.diagnose(
            "error",
            `could not parse \\begin{${environment}} arguments`,
            envNode.begin.loc
          );
          this.environment.env = {};
          this.environment.env.xunit = this.settings.xunit;
          this.environment.env.yunit = this.settings.yunit;
          return;
        }
        this.environment.env = this.PSTricks.Functions[environment].call(
          this.settings,
          this.environment.match
        );
        if (environment.match(/pspicture/)) {
          if (typeof this.environment.env.xunit === "undefined") {
            this.environment.env.xunit = this.settings.xunit;
          }
          if (typeof this.environment.env.yunit === "undefined") {
            this.environment.env.yunit = this.settings.yunit;
          }
          if (typeof this.environment.env.runit === "undefined") {
            this.environment.env.runit = this.settings.runit;
          }
          this.environment.env.dialect = this.dialect;
        }
      }
    }
    // -------------------------------------------------------------------------
    // PSTricks command extraction (ordered)
    // -------------------------------------------------------------------------
    /**
     * Extract plot data from the ordered command nodes of a pspicture.
     * Returns the grouped `plot` map (keyed by command type, used by the
     * interactive re-render paths) and records the ordered `elements` list on
     * the env for source-order initial rendering.
     */
    parsePSTricks(commands, env) {
      var plot = {};
      const entries = Object.entries(this.PSTricks.Expressions);
      entries.forEach(([k, _exp]) => {
        plot[k] = [];
      });
      const elements = [];
      this.extractCommands(commands, env, plot, elements);
      env.elements = elements;
      return plot;
    }
    /**
     * Extract one command node into `plot` (grouped) and `elements` (ordered).
     * Recurses into `\multido` bodies (expanded, counter substituted) and
     * `\pscustom` bodies (the renderer re-parses those itself — the command is
     * kept as a single element with its raw body).
     */
    extractCommands(commands, env, plot, elements) {
      commands.forEach((node) => {
        const k = node.name;
        const exp = this.PSTricks.Expressions[k];
        if (!exp) {
          this.diagnose("warning", `unknown command \\${k} in pspicture`, node.loc);
          return;
        }
        const raw = node.raw.replace(/\n/g, " ");
        const m = raw.match(exp);
        if (!m) {
          this.diagnose(
            "warning",
            `could not parse \\${k}: ${JSON.stringify(node.raw)}`,
            node.loc
          );
          return;
        }
        const cmdEnv = envForUnits(env, node.units);
        const data = this.PSTricks.Functions[k].call(cmdEnv, m);
        applyPsset(data, node.settings, node.raw);
        normalizeArrows(data);
        if (k === "multido") {
          this.expandMultido(data, env, plot, elements, node);
          return;
        }
        if (k === "pscustom" && data.body) {
          data.commands = this.extractCustomBody(data.body, cmdEnv);
        }
        if (k === "rput") {
          const children = this.extractCustomBody(braceGroup(node.raw), cmdEnv);
          if (children.length) {
            const originX = (cmdEnv.w - cmdEnv.x1) * cmdEnv.xunit;
            const originY = cmdEnv.y1 * cmdEnv.yunit;
            elements.push({
              name: "rputgroup",
              data: { dx: data.x - originX, dy: data.y - originY, children },
              match: m,
              fn: this.PSTricks.Functions[k],
              loc: node.loc
            });
            return;
          }
          if (typeof data.text === "string") {
            data.text = this.parseLabel(data.text);
          }
        }
        plot[k].push({ data, env, match: m, fn: this.PSTricks.Functions[k] });
        if (this.dialect === "pstricks") {
          for (const use of dialectUses(k, node.raw ?? "", data)) {
            this.diagnose(
              "warning",
              `${use.construct} is a LaTeX2JS extension: ${use.detail}. Declare \\psset{dialect=latex2js} if that is intended.`,
              node.loc
            );
          }
        }
        if (data && data.plotpointsIgnored !== void 0) {
          this.diagnose(
            "warning",
            `plotpoints=${data.plotpointsIgnored} needs at least 2 samples to mean anything; the default sampling was used instead`,
            node.loc
          );
        }
        const bad = nonFiniteFields(data);
        if (bad.length) {
          this.diagnose(
            "warning",
            `\\${k} produced no usable value for ${bad.join(", ")}; it will not be drawn`,
            node.loc
          );
        }
        elements.push({ name: k, data, match: m, fn: this.PSTricks.Functions[k], loc: node.loc });
        if (k === "psaxes" && plot[k].length > 0) {
          const axesData = plot[k][plot[k].length - 1].data;
          if (axesData && axesData.dx !== void 0) {
            env.dx = axesData.dx;
            env.dy = axesData.dy;
            env.origin = axesData.origin;
          }
        }
        if (k === "uservariable") {
          env.variables = env.variables || {};
          env.variables[data.name] = data.value;
        }
      });
    }
    /** Expand a \multido loop into its constituent commands. */
    expandMultido(data, env, plot, elements, node) {
      if (!data.variable || !(data.count > 0) || !data.body) return;
      const re = new RegExp("\\\\" + data.variable + "\\b", "g");
      for (let i = 0; i < data.count; i++) {
        const value = data.start + i * data.step;
        const body = data.body.replace(re, String(value));
        this.commandNodesFrom(this.parseTree(body)).forEach((cmd) => {
          this.extractCommands([cmd], env, plot, elements);
        });
      }
    }
    /**
     * Extract the inner commands of a \pscustom body into pixel data for the
     * renderer. Commands that need DOM/runtime handling (rput, slider, psset,
     * nested pscustom, multido) are skipped.
     */
    extractCustomBody(body, env) {
      const out = [];
      const skip = ["rput", "slider", "psset", "pspicture", "pscustom", "multido", "uservariable"];
      this.commandNodesFrom(this.parseTree(body)).forEach((node) => {
        const k = node.name;
        if (skip.indexOf(k) !== -1) return;
        const exp = this.PSTricks.Expressions[k];
        if (!exp) return;
        const m = node.raw.replace(/\n/g, " ").match(exp);
        if (!m) return;
        try {
          const data = this.PSTricks.Functions[k].call(env, m);
          if (data) out.push({ key: k, data });
        } catch (err) {
        }
      });
      return out;
    }
    /**
     * Flatten parsed segments into an ordered list of command nodes, walking
     * into line parts and nested environments.
     */
    commandNodesFrom(segs) {
      const out = [];
      const walk = (seg) => {
        if (seg.kind === "command") out.push(seg);
        else if (seg.kind === "line") {
          (seg.parts || []).forEach((p) => {
            if (p.kind === "command") out.push(p);
          });
        } else if (seg.kind === "env") {
          (seg.content || []).forEach(walk);
        }
      };
      segs.forEach(walk);
      return out;
    }
    // -------------------------------------------------------------------------
    // Text / header transforms (reused from the old parser, string-based)
    // -------------------------------------------------------------------------
    /**
     * Text transforms run in sequence over one line, so each must match the
     * value the previous ones produced. Matching the pristine line instead makes
     * `matchrepl` search `contents` for a literal that an earlier transform has
     * already rewritten, and the replacement silently does nothing — which is
     * why `\section{Cauchy--Schwarz}` survived as source text once `--` had
     * become an en dash.
     */
    parseTextExpression(_line, exp, k, contents) {
      var match = contents.match(exp);
      if (match) {
        return this.Text.Functions[k].call(this, match, contents);
      }
      return contents;
    }
    parseHeadersExpression(line, exp, k, contents) {
      var match = line.match(exp);
      if (match) {
        return this.Headers.Functions[k].call(this, match);
      }
      return contents;
    }
    parseText(line) {
      var contents = this.parseTextTransforms(line);
      Object.entries(this.Headers.Expressions).forEach(([k, exp]) => {
        contents = this.parseHeadersExpression(line, exp, k, contents);
      });
      return contents;
    }
    parseLabel(line) {
      var contents = "";
      var textStart = 0;
      var mathStart = -1;
      for (var i = 0; i < line.length; i++) {
        if (line[i] !== "$") {
          continue;
        }
        if (mathStart === -1) {
          contents += this.parseTextTransforms(line.slice(textStart, i));
          mathStart = i;
        } else {
          contents += line.slice(mathStart, i + 1);
          textStart = i + 1;
          mathStart = -1;
        }
      }
      if (mathStart === -1) {
        contents += this.parseTextTransforms(line.slice(textStart));
      } else {
        contents += this.parseTextTransforms(line.slice(mathStart));
      }
      return contents;
    }
    parseTextTransforms(line) {
      var contents = line;
      Object.entries(this.Text.Expressions).forEach(([k, exp]) => {
        contents = this.parseTextExpression(line, exp, k, contents);
      });
      return contents;
    }
    // -------------------------------------------------------------------------
    // Diagnostics
    // -------------------------------------------------------------------------
    diagnose(severity, message, loc) {
      this.diagnostics.push({
        severity,
        message,
        line: loc ? loc.line : void 0,
        column: loc ? loc.column : void 0
      });
    }
  };
  var parser_default = Parser2;

  // ../latex2js/src/index.ts
  var LaTeX2HTML5 = class {
    constructor(Text = text_default, Headers = headers_default, Environments = environments_default, Ignore = ignore_default, PSTricks = pstricks_default, Views = {}) {
      this.lastDiagnostics = [];
      /**
       * Which language documents are read as, when they do not declare one.
       *
       * An application that only ever renders LaTeX2JS content sets this once
       * rather than editing every document; a document's own
       * `\psset{dialect=...}` still overrides it. Defaults to `pstricks`, so an
       * undeclared extension is reported rather than passing unnoticed.
       */
      this.dialect = "pstricks";
      this.Text = Text;
      this.Headers = Headers;
      this.Environments = Environments;
      this.Ignore = Ignore;
      this.PSTricks = PSTricks;
      this.Views = Views;
      this.Delimiters = {};
      Environments.forEach((name) => {
        this.addEnvironment(name);
      });
    }
    addEnvironment(name) {
      var delim = {
        begin: new RegExp("\\\\begin\\{" + name + "\\}"),
        end: new RegExp("\\\\end\\{" + name + "\\}")
      };
      this.Delimiters[name] = delim;
    }
    addView(name, _options) {
      this.addEnvironment(name);
    }
    addText(name, exp, func) {
      this.Text.Expressions[name] = exp;
      this.Text.Functions[name] = func;
    }
    addHeaders(name, begin, end) {
      var exp = {};
      var beginHash = name + "begin";
      var endHash = name + "end";
      exp[beginHash] = new RegExp("\\\\begin\\{" + name + "\\}");
      exp[endHash] = new RegExp("\\\\end\\{" + name + "\\}");
      Object.assign(this.Headers.Expressions, exp);
      var fns = {};
      fns[beginHash] = function() {
        return begin || "";
      };
      fns[endHash] = function() {
        return end || "";
      };
      Object.assign(this.Headers.Functions, fns);
    }
    getParser() {
      return new parser_default(this);
    }
    parse(text) {
      const parser = new parser_default(this);
      const parsed = parser.parse(text);
      this.lastDiagnostics = parser.diagnostics;
      parsed.forEach((element) => {
        if (!element.hasOwnProperty("type")) {
          throw new Error("no type!");
        }
      });
      return parsed;
    }
  };

  // ../mathjaxjs/src/index.ts
  var DEFAULT_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/mathjax@4.1.3/tex-chtml.js";
  var DEFAULT_CONFIG = {
    tex: {
      inlineMath: [["$", "$"], ["\\(", "\\)"]],
      displayMath: [["$$", "$$"], ["\\[", "\\]"]],
      processEscapes: true,
      processEnvironments: true,
      // Number AMS environments — equation, align, gather — and resolve \label
      // and \ref against those numbers. Equation numbering stays with MathJax
      // rather than the parser: it already owns the math, and two systems
      // numbering the same document would disagree.
      tags: "ams",
      packages: ["base", "ams", "newcommand", "configmacros"]
    },
    chtml: {
      linebreaks: { automatic: true, width: "container" }
    },
    startup: {
      ready: () => {
        console.log("MathJax v3 startup ready");
      }
    }
  };
  function deepMerge(base, override) {
    if (override === void 0) return base;
    const mergeable = (v) => v !== null && typeof v === "object" && !Array.isArray(v) && typeof v !== "function";
    if (!mergeable(base) || !mergeable(override)) return override;
    const out = { ...base };
    for (const key of Object.keys(override)) {
      out[key] = mergeable(base[key]) && mergeable(override[key]) ? deepMerge(base[key], override[key]) : override[key];
    }
    return out;
  }
  var mathJaxInstance = null;
  var pendingCallbacks = [];
  var drainPendingCallbacks = () => {
    const callbacks = pendingCallbacks;
    pendingCallbacks = [];
    callbacks.forEach((cb) => cb());
  };
  var getMathJax = () => mathJaxInstance || globalThis.MathJax;
  var loadMathJax = async (callback = () => {
  }, config = DEFAULT_CONFIG) => {
    if (typeof window === "undefined") {
      callback();
      return;
    }
    const existing = globalThis.MathJax;
    if (existing && typeof existing.typesetPromise === "function") {
      mathJaxInstance = existing;
      callback();
      return;
    }
    if (typeof document !== "undefined" && document.getElementById("MathJax-script")) {
      pendingCallbacks.push(callback);
      return;
    }
    const { scriptURL = DEFAULT_SCRIPT_URL, ...mathjaxConfig } = config;
    const preconfigured = existing && typeof existing === "object" ? existing : {};
    const merged = deepMerge(
      deepMerge(DEFAULT_CONFIG, preconfigured),
      mathjaxConfig
    );
    try {
      globalThis.MathJax = {
        ...merged,
        startup: {
          ...merged.startup,
          ready: () => {
            globalThis.MathJax.startup.defaultReady();
            mathJaxInstance = globalThis.MathJax;
            if (merged.startup.ready) {
              merged.startup.ready();
            }
            callback();
            drainPendingCallbacks();
          }
        }
      };
      const script = document.createElement("script");
      script.src = scriptURL;
      script.async = true;
      script.id = "MathJax-script";
      script.onload = () => {
        console.log("MathJax v3 script loaded from CDN");
      };
      script.onerror = () => {
        console.error("Failed to load MathJax v3 from CDN");
        callback();
        drainPendingCallbacks();
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error("Failed to load MathJax v3:", error);
      callback();
    }
  };

  // src/components/pspicture.ts
  function render(that) {
    const size = psgraph_default.getSize.call(that);
    const width = `${size.width}px`;
    const height = `${size.height}px`;
    const div = document.createElement("div");
    div.className = "pspicture";
    div.style.width = width;
    div.style.height = height;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    var svgEl = select(svg);
    that.$el = div;
    psgraph_default.pspicture.call(that, svgEl);
    div.appendChild(svg);
    const { env, plot } = that;
    const { sliders } = env;
    if (sliders && sliders.length) {
      sliders.forEach((slider) => {
        const { latex, scalar, variable, value, min, max } = slider;
        const onChange = (event) => {
          const target = event.target;
          var val = Number(target.value) / scalar;
          if (!env.variables) env.variables = {};
          env.variables[variable] = val;
          const redraw = that.redraw;
          if (typeof redraw === "function") {
            redraw({ changed: [variable] });
            return;
          }
          svgEl.selectAll(".psplot").remove();
          Object.entries(plot).forEach(([k, plotData]) => {
            if (k.match(/psplot/)) {
              plotData.forEach((data) => {
                const d = data.fn.call(data.env, data.match);
                if (psgraph_default[k] && d && svgEl) {
                  psgraph_default[k].call(d, svgEl);
                }
              });
            }
          });
        };
        const label = document.createElement("label");
        const text = document.createTextNode(latex);
        const input = document.createElement("input");
        input.setAttribute("min", String(min * scalar));
        input.setAttribute("max", String(max * scalar));
        input.setAttribute("type", "range");
        input.setAttribute("value", value);
        label.appendChild(text);
        label.appendChild(input);
        div.appendChild(label);
        input.addEventListener("input", (event) => {
          onChange(event);
        });
      });
    }
    return div;
  }

  // src/components/nicebox.ts
  function render2(that) {
    const span = document.createElement("span");
    span.className = "math nicebox";
    span.innerHTML = that.lines.join("\n");
    return span;
  }

  // src/components/enumerate.ts
  function render3(that) {
    const lines = that.lines.map((line) => {
      var m = line.match(/\\item (.*)/);
      if (m) {
        return "<li>" + m[1] + "</li>";
      } else {
        return line;
      }
    }).join("\n");
    const ul = document.createElement("ul");
    ul.className = "math";
    ul.innerHTML = lines;
    return ul;
  }

  // src/components/list.ts
  function itemizeLine(line) {
    var m = line.match(/\\item (.*)/);
    if (m) return "<li>" + m[1] + "</li>";
    return line;
  }
  function descriptionLine(line) {
    var m = line.match(/\\item\[([^\]]*)\]\s*(.*)/);
    if (m) return "<dt>" + m[1] + "</dt><dd>" + m[2] + "</dd>";
    return itemizeLine(line);
  }
  function render4(that) {
    const type = that.type || "enumerate";
    const convert = type === "description" ? descriptionLine : itemizeLine;
    const lines = that.lines.map(convert).join("\n");
    let el;
    if (type === "enumerate") {
      const ol = document.createElement("ol");
      ol.className = "math enumerate";
      ol.innerHTML = lines;
      el = ol;
    } else if (type === "description") {
      const dl = document.createElement("dl");
      dl.className = "math description";
      dl.innerHTML = lines;
      el = dl;
    } else {
      const ul = document.createElement("ul");
      ul.className = "math itemize";
      ul.innerHTML = lines;
      el = ul;
    }
    return el;
  }

  // src/components/verbatim.ts
  function render5(that) {
    var pre = document.createElement("pre");
    pre.className = "verbatim";
    pre.innerHTML = that.lines.join("\n");
    return pre;
  }

  // src/components/math.ts
  function render6(that) {
    const div = document.createElement("div");
    div.className = "math";
    div.innerHTML = that.lines.join("\n");
    return div;
  }

  // ../macros/src/index.ts
  var src_default2 = String.raw`
  $$
  % create the definition symbol
  \def\bydef{\stackrel{\Delta}{=}}
  %\def\circconv{\otimes}
  \def\circconv{\circledast}

  \newcommand{\qed}{\mbox{ } \Box}


  \newcommand{\infint}{\int_{-\infty}^{\infty}}

  % z transform
  \newcommand{\ztp}{ ~~ \mathop{\mathcal{Z}}\limits_{\longleftrightarrow} ~~ }
  \newcommand{\iztp}{ ~~ \mathop{\mathcal{Z}^{-1}}\limits_{\longleftrightarrow} ~~ }
  % fourier transform pair
  \newcommand{\ftp}{ ~~ \mathop{\mathcal{F}}\limits_{\longleftrightarrow} ~~ }
  \newcommand{\iftp}{ ~~ \mathop{\mathcal{F}^{-1}}\limits_{\longleftrightarrow} ~~ }
  % laplace transform
  \newcommand{\ltp}{ ~~ \mathop{\mathcal{L}}\limits_{\longleftrightarrow} ~~ }
  \newcommand{\iltp}{ ~~ \mathop{\mathcal{L}^{-1}}\limits_{\longleftrightarrow} ~~ }

  \newcommand{\ftrans}[1]{ \mathcal{F} \left\{#1\right\} }
  \newcommand{\iftrans}[1]{ \mathcal{F}^{-1} \left\{#1\right\} }
  \newcommand{\ztrans}[1]{ \mathcal{Z} \left\{#1\right\} }
  \newcommand{\iztrans}[1]{ \mathcal{Z}^{-1} \left\{#1\right\} }
  \newcommand{\ltrans}[1]{ \mathcal{L} \left\{#1\right\} }
  \newcommand{\iltrans}[1]{ \mathcal{L}^{-1} \left\{#1\right\} }


  % coordinate vector relative to a basis (linear algebra)
  \newcommand{\cvrb}[2]{\left[ \vec{#1} \right]_{#2} }
  % change of coordinate matrix (linear algebra)
  \newcommand{\cocm}[2]{ \mathop{P}\limits_{#2 \leftarrow #1} }
  % Transformed vector set
  \newcommand{\tset}[3]{\{#1\lr{\vec{#2}_1}, #1\lr{\vec{#2}_2}, \dots, #1\lr{\vec{#2}_{#3}}\}}
  % sum transformed vector set
  \newcommand{\tsetcsum}[4]{{#1}_1#2(\vec{#3}_1) + {#1}_2#2(\vec{#3}_2) + \cdots + {#1}_{#4}#2(\vec{#3}_{#4})}
  \newcommand{\tsetcsumall}[4]{#2\lr{{#1}_1\vec{#3}_1 + {#1}_2\vec{#3}_2 + \cdots + {#1}_{#4}\vec{#3}_{#4}}}
  \newcommand{\cvecsum}[3]{{#1}_1\vec{#2}_1 + {#1}_2\vec{#2}_2 + \cdots + {#1}_{#3}\vec{#2}_{#3}}


  % function def
  \newcommand{\fndef}[3]{#1:#2 \to #3}
  % vector set
  \newcommand{\vset}[2]{\{\vec{#1}_1, \vec{#1}_2, \dots, \vec{#1}_{#2}\}}
  % absolute value
  \newcommand{\abs}[1]{\left| #1 \right|}
  % vector norm
  \newcommand{\norm}[1]{\left|\left| #1 \right|\right|}
  % trans
  \newcommand{\trans}{\mapsto}
  % evaluate integral
  \newcommand{\evalint}[3]{\left. #1 \right|_{#2}^{#3}}
  % slist
  \newcommand{\slist}[2]{{#1}_{1},{#1}_{2},\dots,{#1}_{#2}}

  % vectors
  \newcommand{\vc}[1]{\textbf{#1}}

  % real
  \newcommand{\Real}[1]{{\Re \mit{e}\left\{{#1}\right\}}}
  % imaginary
  \newcommand{\Imag}[1]{{\Im \mit{m}\left\{{#1}\right\}}}

  \newcommand{\mcal}[1]{\mathcal{#1}}
  \newcommand{\bb}[1]{\mathbb{#1}}
  \newcommand{\N}{\mathbb{N}}
  \newcommand{\Z}{\mathbb{Z}}
  \newcommand{\Q}{\mathbb{Q}}
  \newcommand{\R}{\mathbb{R}}
  \newcommand{\C}{\mathbb{C}}
  \newcommand{\I}{\mathbb{I}}
  \newcommand{\Th}[1]{\mathop\mathrm{Th(#1)}}
  \newcommand{\intersect}{\cap}
  \newcommand{\union}{\cup}
  \newcommand{\intersectop}{\bigcap}
  \newcommand{\unionop}{\bigcup}
  \newcommand{\setdiff}{\backslash}
  \newcommand{\iso}{\cong}
  \newcommand{\aut}[1]{\mathop{\mathrm{Aut(#1)}}}
  \newcommand{\inn}[1]{\mathop{\mathrm{Inn(#1)}}}
  \newcommand{\Ann}[1]{\mathop{\mathrm{Ann(#1)}}}
  \newcommand{\dom}[1]{\mathop{\mathrm{dom} #1}}
  \newcommand{\cod}[1]{\mathop{\mathrm{cod} #1}}
  \newcommand{\id}{\mathrm{id}}
  \newcommand{\st}{\ |\ }
  \newcommand{\mbf}[1]{\mathbf{#1}}
  \newcommand{\enclose}[1]{\left\langle #1\right\rangle}
  \newcommand{\lr}[1]{\left( #1\right)}
  \newcommand{\lrsq}[1]{\left[ #1\right]}
  \newcommand{\op}{\mathrm{op}}
  \newcommand{\dotarr}{\dot{\rightarrow}}
  %Category Names:
  \newcommand{\Grp}{\mathbf{Grp}}
  \newcommand{\Ab}{\mathbf{Ab}}
  \newcommand{\Set}{\mathbf{Set}}
  \newcommand{\Matr}{\mathbf{Matr}}
  \newcommand{\IntDom}{\mathbf{IntDom}}
  \newcommand{\Field}{\mathbf{Field}}
  \newcommand{\Vect}{\mathbf{Vect}}

  \newcommand{\thm}[1]{\begin{theorem} #1 \end{theorem}}
  \newcommand{\clm}[1]{\begin{claim} #1 \end{claim}}
  \newcommand{\cor}[1]{\begin{corollary} #1 \end{corollary}}
  \newcommand{\ex}[1]{\begin{example} #1 \end{example}}
  \newcommand{\prf}[1]{\begin{proof} #1 \end{proof}}
  \newcommand{\prbm}[1]{\begin{problem} #1 \end{problem}}
  \newcommand{\soln}[1]{\begin{solution} #1 \end{solution}}
  \newcommand{\rmk}[1]{\begin{remark} #1 \end{remark}}
  \newcommand{\defn}[1]{\begin{definition} #1 \end{definition}}

  \newcommand{\ifff}{\Leftrightarrow}

  % For the set of reals and integers
  \newcommand{\rr}{\R}
  \newcommand{\reals}{\R}
  \newcommand{\ii}{\Z}
  \newcommand{\cc}{\C}
  \newcommand{\nn}{\N}
  \newcommand{\nats}{\N}

  % For bold terms to be indexed, but defined elsewhere.
  \newcommand{\strong}[1]{\textbf{#1}}

  % For set names: italics; in math mode, yields decent spacing.
  \newcommand{\set}[1]{\textit{#1}}

  $$
  `;

  // src/components/macros.ts
  function render7(_that) {
    var div = document.createElement("div");
    div.id = "latex-macros";
    div.style.display = "none";
    div.className = "verbatim";
    div.innerHTML = src_default2;
    return div;
  }

  // src/index.ts
  var ELEMENTS = { pspicture: render, nicebox: render2, enumerate: render3, itemize: render4, description: render4, verbatim: render5, math: render6, macros: render7 };
  function render8(tex, resolve, config) {
    const done = () => {
      const latex = new LaTeX2HTML5();
      const parsed = latex.parse(tex);
      const div = document.createElement("div");
      div.className = "latex-container";
      parsed && parsed.forEach && parsed.forEach((el) => {
        if (ELEMENTS.hasOwnProperty(el.type)) {
          const elementType = el.type;
          div.appendChild(ELEMENTS[elementType](el));
        }
      });
      resolve(div);
    };
    if (getMathJax()) {
      return done();
    }
    loadMathJax(done, config);
  }
  var init = (config) => {
    loadMathJax(void 0, config);
    document.querySelectorAll('script[type="text/latex"]').forEach((el) => {
      render8(
        el.innerHTML,
        (div) => {
          if (el.parentNode) {
            el.parentNode.insertBefore(div, el.nextSibling);
          }
        },
        config
      );
    });
  };
  return __toCommonJS(index_exports);
})();
