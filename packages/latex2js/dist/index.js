"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const text_1 = __importDefault(require("./lib/text"));
const headers_1 = __importDefault(require("./lib/headers"));
const pstricks_1 = require("@latex2js/pstricks");
const environments_1 = __importDefault(require("./lib/environments"));
const ignore_1 = __importDefault(require("./lib/ignore"));
const parser_1 = __importDefault(require("./lib/parser"));
class LaTeX2HTML5 {
    constructor(Text = text_1.default, Headers = headers_1.default, Environments = environments_1.default, Ignore = ignore_1.default, PSTricks = pstricks_1.pstricks, Views = {}) {
        this.Text = Text;
        this.Headers = Headers;
        this.Environments = Environments;
        this.Ignore = Ignore;
        this.PSTricks = PSTricks;
        this.Views = Views;
        this.Delimiters = {};
        Environments.forEach((name) => {
            this.addEnvironment(name);
        });
    }
    addEnvironment(name) {
        var delim = {
            begin: new RegExp('\\\\begin\\{' + name + '\\}'),
            end: new RegExp('\\\\end\\{' + name + '\\}')
        };
        this.Delimiters[name] = delim;
    }
    addView(name, _options) {
        this.addEnvironment(name);
        // var view = {};
        // this.Views[name] = this.BaseEnvView.extend(options);
    }
    addText(name, exp, func) {
        this.Text.Expressions[name] = exp;
        this.Text.Functions[name] = func;
    }
    addHeaders(name, begin, end) {
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
    getParser() {
        return new parser_1.default(this);
    }
    parse(text) {
        const parser = new parser_1.default(this);
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
exports.default = LaTeX2HTML5;
