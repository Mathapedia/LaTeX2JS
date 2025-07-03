declare class Parser {
    Ignore: any;
    Delimiters: any;
    Text: any;
    PSTricks: any;
    Headers: any;
    objects: any[];
    environment: any;
    settings: any;
    constructor(LaTeX2JS: any);
    parse(text: string): any[];
    newEnvironment(type: string): void;
    pushLine(line: string): void;
    parseUnits(line: string): void;
    metaData(environment: string, line: string): void;
    parseEnv(lines: string[]): void;
    parseEnvText(lines: string[]): void;
    parsePSExpression(line: string, exp: RegExp, plot: any, k: string, env: any): boolean;
    parsePSVariables(line: string, exp: RegExp, _plot: any, k: string, env: any): void;
    parsePSTricks(lines: string[], env: any): any;
    parseTextExpression(line: string, exp: RegExp, k: string, contents: string): string;
    parseHeadersExpression(line: string, exp: RegExp, k: string, contents: string): string;
    parseText(line: string): string;
}
export default Parser;
