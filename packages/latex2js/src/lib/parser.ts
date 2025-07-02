class Parser {
  Ignore: any;
  Delimiters: any;
  Text: any;
  PSTricks: any;
  Headers: any;
  objects: any[];
  environment: any;
  settings: any;

  constructor(LaTeX2JS: any) {
    this.Ignore = LaTeX2JS.Ignore;
    this.Delimiters = LaTeX2JS.Delimiters;
    this.Text = LaTeX2JS.Text;
    this.PSTricks = LaTeX2JS.PSTricks;
    this.Headers = LaTeX2JS.Headers;
    this.objects = [];
    this.environment = null;
    this.settings = this.PSTricks.Functions.psset.call(this, [
      '',
      'units=1cm,linecolor=black,linestyle=solid,fillstyle=none'
    ]);
  }
  parse(text: string): any[] {
    if (!text) return [];
    var lines = text.split('\n');
    this.parseEnvText(lines);
    this.parseEnv(lines);

    this.objects.forEach((obj) => {
      if (obj.type.match(/pspicture/)) {
        obj.plot = this.parsePSTricks(obj.lines, obj.env);
      }
    });
    return this.objects;
  }

  newEnvironment(type: string): void {
    if (this.environment && this.environment.lines.length) {
      this.environment.settings = { ...this.settings };
      this.objects.push(this.environment);
    }
    this.environment = {
      type: type,
      lines: []
    };
  }

  pushLine(line: string): void {
    var add = true;
    this.Ignore.forEach((exp: RegExp) => {
      if (exp.test(line)) {
        add = false;
      }
    });
    if (add) {
      if (typeof line === 'string' && line.trim().length) {
        if (this.PSTricks.Expressions.psset.test(line)) {
          this.parseUnits(line);
        } else {
          this.environment.lines.push(line);
        }
      }
    }
  }

  parseUnits(line: string): void {
    var m = line.match(this.PSTricks.Expressions.psset);
    Object.assign(this.settings, this.PSTricks.Functions.psset.call(this, m));
  }

  metaData(environment: string, line: string): void {
    if (this.PSTricks.Expressions.hasOwnProperty(environment)) {
      this.environment.match = line.match(
        this.PSTricks.Expressions[environment]
      );
      this.environment.env = this.PSTricks.Functions[environment].call(
        this.settings,
        this.environment.match
      );
      if (environment.match(/pspicture/)) {
        if (typeof this.environment.env.xunit === 'undefined') {
          this.environment.env.xunit = this.settings.xunit;
        }
        if (typeof this.environment.env.yunit === 'undefined') {
          this.environment.env.yunit = this.settings.yunit;
        }
      }
    }
  }

  parseEnv(lines: string[]): void {
    this.objects = [];
    this.environment = {
      type: 'math',
      lines: []
    };
    const Delimiters = this.Delimiters;

    lines.forEach((line) => {
      var isDelim = false;
      Object.entries(Delimiters).forEach(([env, type]: [string, any]) => {
        Object.entries(type).forEach(([k, delim]: [string, any]) => {
          if (line.match(delim)) {
            isDelim = true;
            if (k.match(/begin/)) {
              if (this.environment.type.match(/verbatim/)) {
                isDelim = false;
              } else if (this.environment.type.match(/print/)) {
                isDelim = false;
              } else {
                this.newEnvironment(env);
                this.metaData(env, line);
              }
            } else if (k.match(/end/)) {
              if (this.environment.type.match(/verbatim/)) {
                if (env.match(/verbatim/)) {
                  this.newEnvironment('math');
                } else {
                  isDelim = false;
                }
              } else if (this.environment.type.match(/print/)) {
                if (env.match(/print/)) {
                  this.newEnvironment('math');
                } else {
                  isDelim = false;
                }
              } else {
                this.newEnvironment('math');
              }
            }
          }
        });
      });
      if (!isDelim) this.pushLine(line); // }
    });

    // push last!
    this.newEnvironment('math');
  }

  parseEnvText(lines: string[]): void {
    var _env = 'math';
    const Delimiters = this.Delimiters;
    lines.forEach((line, i) => {
      var isDelim = false;
      Object.entries(Delimiters).forEach(([env, type]: [string, any]) => {
        Object.entries(type).forEach(([k, delim]: [string, any]) => {
          if (line.match(delim)) {
            isDelim = true;
            if (k.match(/begin/)) {
              if (!_env.match(/verbatim/)) {
                _env = env;
              } else {
                isDelim = false;
              }
            } else if (k.match(/end/)) {
              if (!_env.match(/verbatim/)) {
                _env = 'math';
              } else {
                if (!env.match(/verbatim/)) {
                  isDelim = false;
                } else {
                  _env = 'math';
                }
              }
            }
          }
        });
      });
      if (!isDelim) {
        if (!_env.match(/verbatim/)) {
          lines[i] = this.parseText(line);
        }
        if (!line.trim().length) {
          lines[i] = '<br>';
        }
      }
    });
  }

  parsePSExpression(line: string, exp: RegExp, plot: any, k: string, env: any): boolean {
    var match = line.match(exp);
    if (match) {
      plot[k].push({
        data: this.PSTricks.Functions[k].call(env, match),
        env: env,
        match: match,
        fn: this.PSTricks.Functions[k]
      });
      return true;
    }
    return false;
  }

  parsePSVariables(line: string, exp: RegExp, _plot: any, k: string, env: any): void {
    var match = line.match(exp);
    if (match) {
      if (k.match(/uservariable/)) {
        var dd = this.PSTricks.Functions[k].call(env, match);
        env.variables = env.variables || {};
        env.variables[dd.name] = dd.value;
      }
    }
  }

  parsePSTricks(lines: string[], env: any): any {
    var plot: { [key: string]: any[] } = {};
    const entries = Object.entries(this.PSTricks.Expressions);
    entries.forEach(([k, _exp]) => {
      plot[k] = [];
    });
    lines.forEach((line) => {
      entries.forEach(([k, exp]: [string, any]) => {
        this.parsePSVariables(line, exp, plot, k, env);
        this.parsePSExpression(line, exp, plot, k, env);
      });
    });
    return plot;
  }

  parseTextExpression(line: string, exp: RegExp, k: string, contents: string): string {
    var match = line.match(exp);
    if (match) {
      return this.Text.Functions[k].call(this, match, contents);
    }
    return contents;
  }

  parseHeadersExpression(line: string, exp: RegExp, k: string, contents: string): string {
    var match = line.match(exp);
    if (match) {
      return this.Headers.Functions[k].call(this);
    }
    return contents;
  }

  parseText(line: string): string {
    var contents = line;
    // TEXT
    Object.entries(this.Text.Expressions).forEach(([k, exp]: [string, any]) => {
      contents = this.parseTextExpression(line, exp, k, contents);
    });

    // HEADERS
    Object.entries(this.Headers.Expressions).forEach(([k, exp]: [string, any]) => {
      contents = this.parseHeadersExpression(line, exp, k, contents);
    });

    return contents;
  }
}

export default Parser;
