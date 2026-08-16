/**
 * Document counters for sectioning and theorem-like environments.
 *
 * Numbering is what makes a document cross-referenceable — "see Theorem 3" only
 * works if theorems are numbered — and LaTeX2JS emitted none, so a rendered
 * document could not be cited from or navigated the way its printed form can.
 *
 * Equations are deliberately absent: those stay with MathJax, which already
 * numbers AMS environments and resolves `\label`/`\ref` against them. Splitting
 * that between two systems would give a document two disagreeing sets of
 * numbers.
 */

/** The sectioning levels, outermost first. */
export const SECTION_LEVELS = ['section', 'subsection', 'subsubsection'] as const;

export type SectionLevel = (typeof SECTION_LEVELS)[number];

/**
 * Counters for one document.
 *
 * A parser instance is reused across documents, so these are reset at the start
 * of every parse; otherwise a second document would continue the first one's
 * numbering.
 */
export class Counters {
  private sections: number[] = SECTION_LEVELS.map(() => 0);
  private environments: { [name: string]: number } = {};

  /** Starts a fresh document. */
  reset(): void {
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
  section(level: SectionLevel): string {
    const depth = SECTION_LEVELS.indexOf(level);
    this.sections[depth] += 1;
    for (let i = depth + 1; i < this.sections.length; i++) this.sections[i] = 0;
    return this.sections.slice(0, depth + 1).join('.');
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
  environment(name: string): number {
    this.environments[name] = (this.environments[name] ?? 0) + 1;
    return this.environments[name];
  }
}

/** Environments that carry a number. `proof` and quotations deliberately do not. */
export const NUMBERED_ENVIRONMENTS = [
  'theorem',
  'lemma',
  'corollary',
  'proposition',
  'definition',
  'axiom',
  'claim',
  'example',
  'remark',
  'note',
  'exercise',
  'question',
  'problem',
  'solution',
];
