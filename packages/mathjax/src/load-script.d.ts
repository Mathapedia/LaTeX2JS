declare module 'load-script' {
  function loadScript(src: string, callback?: (error?: Error) => void): void;
  export = loadScript;
}
