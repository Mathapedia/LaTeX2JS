import React, { useEffect, useState, ReactNode } from 'react';

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

export default function MathJaxProvider({ 
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

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
    script.async = true;
    script.onload = () => {
      console.log('MathJax script loaded');
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
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
      {mathJaxLoaded ? children : (loadingComponent || <div>Loading MathJax...</div>)}
    </div>
  );
}
