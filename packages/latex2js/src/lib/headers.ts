export const Expressions = {
  bq: /\\begin\{quotation\}/,
  claim: /\\begin\{claim\}/,
  corollary: /\\begin\{corollary\}/,
  definition: /\\begin\{definition\}/,
  endclaim: /\\end\{claim\}/,
  endcorallary: /\\end\{corallary\}/,
  enddefinition: /\\end\{definition\}/,
  endexample: /\\end\{example\}/,
  endproblem: /\\end\{problem\}/,
  endsolution: /\\end\{solution\}/,
  endtheorem: /\\end\{theorem\}/,
  eq: /\\end\{quotation\}/,
  example: /\\begin\{example\}/,
  problem: /\\begin\{problem\}/,
  proof: /\\begin\{proof\}/,
  qed: /\\end\{proof\}/,
  solution: /\\begin\{solution\}/,
  theorem: /\\begin\{theorem\}/
};

export const Functions = {
  bq: () => '<p class="quotation">',
  claim: () => '<h4>Claim</h4>',
  corollary: () => '<h4>Corollary</h4>',
  definition: () => '<h4>Definition</h4>',
  endclaim: () => '',
  endcorollary: () => '',
  enddefinition: () => '',
  endexample: () => '',
  endproblem: () => '',
  endsolution: () => '',
  endtheorem: () => '',
  eq: () => '</p>',
  example: () => '<h4>Example</h4>',
  problem: () => '<h4>Problem</h4>',
  proof: () => '<h4>Proof</h4>',
  qed: () => '$\\qed$',
  solution: () => '<h4>Solution</h4>',
  theorem: () => '<h4>Theorem</h4>'
};

export default {
  Expressions,
  Functions
};
