import React from 'react';
export default ({ lines }) => (
  <span
    className="math nicebox"
    dangerouslySetInnerHTML={{ __html: lines.join('\n') }}
  />
);
