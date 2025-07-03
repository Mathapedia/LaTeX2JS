
let React: any;
let useEffect: any;
let useState: any;

try {
  React = require('react');
  useEffect = React.useEffect;
  useState = React.useState;
} catch (e) {
  React = null;
}

import { DEFAULT_CONFIG, getMathJax, loadMathJax } from '../index';

declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathJaxConfig {
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
  loadingComponent?: any;
  className?: string;
}

function MathJaxProvider({ 
  children, 
  config,
  loadingComponent,
  className = ""
}: MathJaxProviderProps) {
  if (!React) {
    throw new Error('React is required to use MathJaxProvider. Please ensure React is installed and available.');
  }

  if (typeof window === 'undefined') {
    return loadingComponent || null;
  }

  const [isClient, setIsClient] = useState(false);
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
    setIsClient(true);
    
    if (getMathJax()) {
      setMathJaxLoaded(true);
    } else {
      loadMathJax(() => {
        setMathJaxLoaded(true);
      }, finalConfig);
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

  if (!isClient) {
    return loadingComponent || React.createElement('div', { className }, 'Loading...');
  }

  return React.createElement('div', { className }, 
    mathJaxLoaded ? children : (loadingComponent || React.createElement('div', null, 'Loading MathJax...'))
  );
}

export default MathJaxProvider;
