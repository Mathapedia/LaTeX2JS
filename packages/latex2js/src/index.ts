import TextExt from './lib/text';
import HeadersExt from './lib/headers';
import { pstricks as PSTricksExt } from 'latex2js-pstricks';
import EnvironmentsDefault from './lib/environments';
import IgnoreDefault from './lib/ignore';

import Parser from './lib/parser';

export default class LaTeX2HTML5 {
  Text: any;
  Headers: any;
  Environments: any;
  Ignore: any;
  PSTricks: any;
  Views: any;
  Delimiters: any;

  constructor(
    Text = TextExt,
    Headers = HeadersExt,
    Environments = EnvironmentsDefault,
    Ignore = IgnoreDefault,
    PSTricks = PSTricksExt,
    Views = {}
  ) {
    this.Text = Text;
    this.Headers = Headers;
    this.Environments = Environments;
    this.Ignore = Ignore;
    this.PSTricks = PSTricks;
    this.Views = Views;
    this.Delimiters = {};

    Environments.forEach((name: string) => {
      this.addEnvironment(name);
    });
  }

  addEnvironment(name: string): void {
    var delim = {
      begin: new RegExp('\\\\begin\\{' + name + '\\}'),
      end: new RegExp('\\\\end\\{' + name + '\\}')
    };
    this.Delimiters[name] = delim;
  }

  addView(name: string, options: any): void {
    this.addEnvironment(name);
    // var view = {};
    // this.Views[name] = this.BaseEnvView.extend(options);
  }

  addText(name: string, exp: RegExp, func: Function): void {
    this.Text.Expressions[name] = exp;
    this.Text.Functions[name] = func;
  }

  addHeaders(name: string, begin?: string, end?: string): void {
    var exp = {};
    var beginHash = name + 'begin';
    var endHash = name + 'end';
    exp[beginHash] = new RegExp('\\\\begin\\{' + name + '\\}');
    exp[endHash] = new RegExp('\\\\end\\{' + name + '\\}');
    Object.assign(this.Headers.Expressions, exp);
    var fns = {};
    fns[beginHash] = function () {
      return begin || '';
    };
    fns[endHash] = function () {
      return end || '';
    };
    Object.assign(this.Headers.Functions, fns);
  }

  getParser(): any {
    return new Parser(this);
  }

  parse(text: string): any[] {
    const parser = new Parser(this);
    const parsed = parser.parse(text);
    parsed.forEach((element) => {
      if (!element.hasOwnProperty('type')) {
        throw new Error('no type!');
      }
      // TODO implement rendering
    });

    return parsed;
  }
}
