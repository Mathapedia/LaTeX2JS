import React, { useEffect, useState } from 'react';
import { DEFAULT_CONFIG, getMathJax, loadMathJax } from '@latex2js/mathjaxjs';
function MathJaxProvider({ children, config, loadingComponent, className = "" }) {
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
            }
            else {
                loadMathJax(() => {
                    setMathJaxLoaded(true);
                }, finalConfig);
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
    return React.createElement('div', { className }, mathJaxLoaded ? children : (loadingComponent || React.createElement('div', null, 'Loading MathJax...')));
}
export default MathJaxProvider;
