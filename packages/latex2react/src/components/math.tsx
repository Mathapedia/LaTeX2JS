import React from 'react';
export default ({ lines }) => (
  <span
    className="math"
    dangerouslySetInnerHTML={{ __html: lines.join('\n') }}
  />
);
