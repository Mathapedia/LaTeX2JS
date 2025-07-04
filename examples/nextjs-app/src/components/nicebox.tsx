import React from 'react';

interface NiceboxProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export default ({ children }: NiceboxProps) => (
  <div className="nicebox" style={{ 
    border: '1px solid #ccc', 
    padding: '10px', 
    margin: '10px 0',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9'
  }}>
    {children}
  </div>
);
