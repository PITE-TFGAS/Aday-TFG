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
var app_1 = require("firebase/app");
var firestore_1 = require("firebase/firestore");
var FirebaseService = /** @class */ (function () {
    function FirebaseService(collectionName, document) {
        this.collectionName = collectionName;
        this.document = document;
        var firebaseConfig = {
            apiKey: "AIzaSyCVNbUt4MNzwNm6gZGpO_A1wyzLjpdXFg4",
            authDomain: "chatbot-6eb81.firebaseapp.com",
            databaseURL: "https://chatbot-6eb81-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "chatbot-6eb81",
            storageBucket: "chatbot-6eb81.firebasestorage.app",
            messagingSenderId: "178109976025",
            appId: "1:178109976025:web:ae4157944f4e4c4d10ddc8",
            measurementId: "G-MZVNB5GGTC"
        };
        this.app = (0, app_1.initializeApp)(firebaseConfig);
        this.db = (0, firestore_1.getFirestore)(this.app);
        this.collectionName = collectionName;
        this.document = document;
    }
    FirebaseService.prototype.readAllData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var querySnapshot, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, firestore_1.getDocs)((0, firestore_1.collection)(this.db, this.collectionName))];
                    case 1:
                        querySnapshot = _a.sent();
                        querySnapshot.forEach(function (doc) {
                            console.log(doc.id, "=>", doc.data());
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Error al leer datos:", error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FirebaseService.prototype.getData = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var docRef, docSnap, data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        docRef = (0, firestore_1.doc)(this.db, this.collectionName, this.document);
                        return [4 /*yield*/, (0, firestore_1.getDoc)(docRef)];
                    case 1:
                        docSnap = _a.sent();
                        if (docSnap.exists()) {
                            data = docSnap.data();
                            if (data && key in data) {
                                return [2 /*return*/, JSON.stringify(data[key]).replace(/\\/g, "")]; // Devuelve solo el valor del campo solicitado
                            }
                            else {
                                console.log("La clave '".concat(key, "' no existe en el documento."));
                                return [2 /*return*/, null];
                            }
                        }
                        else {
                            console.log("El documento no existe.");
                            return [2 /*return*/, null];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error al leer datos:", error_2);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FirebaseService.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, app_1.deleteApp)(this.app)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return FirebaseService;
}());
exports.default = FirebaseService;
