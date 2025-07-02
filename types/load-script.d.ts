declare module 'load-script' {
  function loadScript(src: string, callback?: () => void): void;
  export = loadScript;
}
