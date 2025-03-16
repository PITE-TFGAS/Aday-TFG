"use strict";
/**
 * Universidad de La Laguna
 * Escuela Superior de Ingeniería y Tecnología
 * Grado en Ingeniería Informática
 * Trabajo de Fin de Grado 2025
 *
 * @author Aday Cuesta Correa
 * @alias alu0101483887
 * @since 13 MARCH 2025
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rl = void 0;
exports.askQuestion = askQuestion;
var readline = require("readline");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
exports.rl = rl;
function askQuestion(question) {
    return new Promise(function (resolve) { return rl.question(question, resolve); });
}
