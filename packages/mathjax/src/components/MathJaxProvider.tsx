
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

const DEFAULT_CONFIG = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true,
    packages: ['base', 'ams', 'newcommand', 'configmacros']
  },
  chtml: {
    linebreaks: { automatic: true, width: 'container' }
  },
  startup: {
    ready: () => {
      console.log('MathJax v3 startup ready');
    }
  }
};

let mathJaxInstance: any = null;

const getMathJax = () => mathJaxInstance || (globalThis as any).MathJax;

const loadMathJax = async (callback = () => {}, config = DEFAULT_CONFIG) => {
  if (typeof window === 'undefined') {
    callback();
    return;
  }

  if ((globalThis as any).MathJax) {
    mathJaxInstance = (globalThis as any).MathJax;
    callback();
    return;
  }

  try {
    (globalThis as any).MathJax = {
      ...config,
      startup: {
        ...config.startup,
        ready: () => {
          (globalThis as any).MathJax.startup.defaultReady();
          mathJaxInstance = (globalThis as any).MathJax;
          console.log('MathJax v3 loaded and initialized successfully');
          if (config.startup?.ready) {
            config.startup.ready();
          }
          callback();
        }
      }
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
    script.async = true;
    script.id = 'MathJax-script';
    script.onload = () => {
      console.log('MathJax v3 script loaded from CDN');
    };
    script.onerror = () => {
      console.error('Failed to load MathJax v3 from CDN');
      callback();
    };
    
    document.head.appendChild(script);
    
  } catch (error) {
    console.error('Failed to load MathJax v3:', error);
    callback();
  }
};

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
