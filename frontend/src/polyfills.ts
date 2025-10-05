// Polyfills for Node.js modules in the browser
import { Buffer } from 'buffer';

// Set up global Buffer
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  (window as any).global = window;
  (window as any).process = {
    env: {},
    version: '',
    nextTick: (fn: Function, ...args: any[]) => {
      setTimeout(() => fn(...args), 0);
    },
  };
}

export {};

