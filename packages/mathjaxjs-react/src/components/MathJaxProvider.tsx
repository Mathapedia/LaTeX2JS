import React, { useEffect, useState } from 'react';
import { DEFAULT_CONFIG, getMathJax, loadMathJax } from 'mathjaxjs';

declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathJaxConfig {
  /** 自定义 MathJax 脚本地址，不传则使用默认 CDN */
  scriptURL?: string;
  tex?: {
    inlineMath?: string[][];
    displayMath?: string[][];
    packages?: string[];
    processEscapes?: boolean;
    processEnvironments?: boolean;
  };
  chtml?: {
    fontURL?: string;
    linebreaks?: { automatic: boolean; width: string };
  };
}

interface MathJaxProviderProps {
  children: any;
  config?: MathJaxConfig;
  /** Custom MathJax script URL; falls back to the config key, then the default CDN. */
  scriptURL?: string;
  loadingComponent?: any;
  className?: string;
}

function MathJaxProvider({ 
  children, 
  config,
  scriptURL: scriptURLProp,
  loadingComponent,
  className = ""
}: MathJaxProviderProps) {
  const [mathJaxLoaded, setMathJaxLoaded] = useState(false);

  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    tex: { 
      ...DEFAULT_CONFIG.tex, 
      ...config?.tex,
      packages: config?.tex?.packages || DEFAULT_CONFIG.tex.packages
    },
    chtml: { ...DEFAULT_CONFIG.chtml, ...config?.chtml }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (getMathJax()) {
        setMathJaxLoaded(true);
      } else {
        loadMathJax(() => {
          setMathJaxLoaded(true);
        }, { ...finalConfig, scriptURL: scriptURLProp ?? config?.scriptURL });
      }
    }
  }, []);

  useEffect(() => {
    if (mathJaxLoaded && getMathJax()) {
      const mathJax = getMathJax();
      if (mathJax && mathJax.typesetPromise) {
        mathJax.typesetPromise().then(() => {
          console.log('MathJax typesetting complete');
        });
      }
    }
  }, [mathJaxLoaded]);

  return React.createElement('div', { className }, 
    mathJaxLoaded ? children : (loadingComponent || React.createElement('div', null, 'Loading MathJax...'))
  );
}

export default MathJaxProvider;
