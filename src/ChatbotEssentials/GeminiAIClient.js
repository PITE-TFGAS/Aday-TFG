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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var generative_ai_1 = require("@google/generative-ai");
var ChatHistoryManager_1 = require("./ChatHistoryManager");
var firebase_1 = require("../Database/firebase");
var GeminiAIClient = /** @class */ (function () {
    function GeminiAIClient(apiKey, maxMessages) {
        if (maxMessages === void 0) { maxMessages = 10; }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.historyManager = new ChatHistoryManager_1.default(maxMessages);
        this.firebaseService = new firebase_1.default("Webpages", "tNmGunHlhU7TwsXeRxBH");
        this.instructions = "Eres un asistente que ayuda a personas mayores a navegar por internet paso a paso. Debes ser claro, paciente y nunca adelantar pasos.\n    Cada vez que recibas un mensaje, tendr\u00E1s el historial de la conversaci\u00F3n y, si es posible, la informaci\u00F3n de la p\u00E1gina en la que est\u00E1 el usuario. Usa esta informaci\u00F3n para guiarlo.\n    Si est\u00E1 en la p\u00E1gina principal, gu\u00EDalo solo a hacer clic en 'Iniciar sesi\u00F3n'.\n    Si est\u00E1 en la p\u00E1gina de inicio de sesi\u00F3n, gu\u00EDalo para que ingrese su usuario y contrase\u00F1a, y luego haga clic en 'Acceder'.\n    Siempre espera la confirmaci\u00F3n del usuario antes de dar el siguiente paso.\n    No asumas que el usuario sabe lo que debe hacer sin pedir confirmaci\u00F3n.\n    S\u00E9 paciente y ayuda a resolver dudas con explicaciones simples.";
    }
    GeminiAIClient.prototype.getModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })];
            });
        });
    };
    GeminiAIClient.prototype.sendMessage = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var model, context, data, result, response, text, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getModel()];
                    case 1:
                        model = _a.sent();
                        context = "Instrucciones Iniciales: ".concat(this.instructions, "\n");
                        context += "Historial del chat: ".concat(this.historyManager.getFormattedHistory(), "\n");
                        return [4 /*yield*/, this.firebaseService.getData("https://www.cajasiete.com/")];
                    case 2:
                        data = _a.sent();
                        context += "Contexto de la p\u00E1gina:".concat(data, "\n");
                        context += "Nuevo mensaje del Usuario: ".concat(prompt);
                        return [4 /*yield*/, model.generateContent(context)];
                    case 3:
                        result = _a.sent();
                        response = result.response;
                        text = response.text();
                        this.historyManager.addMessage("Usuario", prompt);
                        this.historyManager.addMessage("Modelo", text);
                        return [2 /*return*/, text];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Error al ejecutar el modelo Gemini:", error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    GeminiAIClient.prototype.clearChatHistory = function () {
        this.historyManager.clearHistory();
    };
    GeminiAIClient.prototype.getChatHistory = function () {
        return this.historyManager.getFormattedHistory();
    };
    GeminiAIClient.prototype.getFirebaseService = function () {
        return this.firebaseService;
    };
    return GeminiAIClient;
}());
exports.default = GeminiAIClient;
