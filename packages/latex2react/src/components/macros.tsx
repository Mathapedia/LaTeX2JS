import React from 'react';
import macroStr from 'latex2js-macros';
export default () => (
  <div
    style={{ display: 'none' }}
    dangerouslySetInnerHTML={{ __html: macroStr }}
  />
);
