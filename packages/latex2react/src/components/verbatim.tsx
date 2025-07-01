import React from 'react';
export default ({ lines }) => (
  <pre
    className="verbatim"
    dangerouslySetInnerHTML={{ __html: lines.join('\n') }}
  />
);
