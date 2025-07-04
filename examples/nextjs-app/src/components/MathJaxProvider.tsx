'use client';

import { useEffect, useState, ReactNode } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';

declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathJaxConfig {
  tex?: {
    inlineMath?: string[][];
    displayMath?: string[][];
    packages?: { [key: string]: string[] };
  };
  chtml?: {
    fontURL?: string;
  };
}

interface MathJaxProviderProps {
  children: ReactNode;
  config?: MathJaxConfig;
  loadingComponent?: ReactNode;
  className?: string;
}

function MathJaxProviderComponent({ 
  children, 
  config,
  loadingComponent,
  className = ""
}: MathJaxProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const [mathJaxLoaded, setMathJaxLoaded] = useState(false);

  const defaultConfig: MathJaxConfig = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      packages: {'[+]': ['ams', 'newcommand', 'configmacros']}
    },
    chtml: {
      fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2'
    }
  };

  const finalConfig = {
    ...defaultConfig,
    ...config,
    tex: { ...defaultConfig.tex, ...config?.tex },
    chtml: { ...defaultConfig.chtml, ...config?.chtml }
  };

  useEffect(() => {
    setIsClient(true);
    
    window.MathJax = {
      ...finalConfig,
      startup: {
        ready: () => {
          console.log('MathJax is ready');
          window.MathJax.startup.defaultReady();
          setMathJaxLoaded(true);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (mathJaxLoaded && window.MathJax) {
      window.MathJax.typesetPromise().then(() => {
        console.log('MathJax typesetting complete');
      });
    }
  }, [mathJaxLoaded]);

  if (!isClient) {
    return loadingComponent || <div className={className}>Loading...</div>;
  }

  return (
    <div className={className}>
      <Script
        id="MathJax-script"
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('MathJax script loaded');
        }}
      />
      {mathJaxLoaded ? children : (loadingComponent || <div>Loading MathJax...</div>)}
    </div>
  );
}

const MathJaxProvider = dynamic(() => Promise.resolve(MathJaxProviderComponent), {
  ssr: false,
  loading: () => <div>Loading MathJax...</div>
});

export default MathJaxProvider;
