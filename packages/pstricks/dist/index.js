"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.psgraph = exports.pstricks = void 0;
const pstricks_1 = __importDefault(require("./lib/pstricks"));
exports.pstricks = pstricks_1.default;
const psgraph_1 = __importDefault(require("./lib/psgraph"));
exports.psgraph = psgraph_1.default;
exports.default = {
    pstricks: pstricks_1.default,
    psgraph: psgraph_1.default,
};
