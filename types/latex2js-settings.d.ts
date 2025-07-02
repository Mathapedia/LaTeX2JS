declare module '@latex2js/settings' {
  const Settings: {
    Expressions: { [key: string]: RegExp };
    Functions: { [key: string]: (obj: any, value: any) => void };
  };
  export default Settings;
}
