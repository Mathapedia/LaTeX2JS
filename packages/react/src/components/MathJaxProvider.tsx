import React, { useEffect, useState, ReactNode } from 'react';

declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathJaxConfig {
  /** 自定义 MathJax 脚本地址 */
  scriptURL?: string;
  tex?: {
    inlineMath?: string[][];
    displayMath?: string[][];
    packages?: { [key: string]: string[] };
  };
  chtml?: {
    fontURL?: string;
  };
}

const DEFAULT_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';

interface MathJaxProviderProps {
  children: ReactNode;
  config?: MathJaxConfig;
  /** 自定义 MathJax 脚本地址，不传则使用默认 CDN */
  scriptURL?: string;
  loadingComponent?: ReactNode;
  className?: string;
}

export default function MathJaxProvider({ 
  children, 
  config,
  scriptURL: scriptURLProp,
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

  const scriptURL = scriptURLProp ?? config?.scriptURL ?? DEFAULT_SCRIPT_URL;

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
    script.src = scriptURL;
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
