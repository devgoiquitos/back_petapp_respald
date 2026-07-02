"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const database_1 = __importDefault(require("../database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const token_util_1 = require("../utils/token.util");
/* carga variable de entorno */
const dotenv_1 = __importDefault(require("dotenv"));
const response_helper_1 = require("../helpers/response.helper");
dotenv_1.default.config();
const saltRounds = 10;
const refresh = process.env.REFRESH_SECRET;
const access = process.env.ACCESS_SECRET;
class AuthController {
    /* LOGIN NORMAL */
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Email, Password } = req.body;
            try {
                const [rows] = yield database_1.default.query('SELECT * FROM persona WHERE Email = ?', [Email]);
                if (rows.length === 0)
                    return (0, response_helper_1.errorResponse)(res, 'Usuario no Encontrado', 400);
                const user = rows[0];
                const match = yield bcrypt_1.default.compare(Password, user.Password);
                if (!match)
                    return (0, response_helper_1.errorResponse)(res, 'Contraseña Incorrecta', 401);
                const payload = { IdPersona: user.IdPersona, Email: user.Email };
                const accessToken = (0, token_util_1.generateAccessToken)(payload);
                const refreshToken = (0, token_util_1.generateRefreshToken)(payload);
                return (0, response_helper_1.successResponse)(res, 'Logueo Exitoso', {
                    accessToken,
                    refreshToken,
                    userLog: {
                        IdPersona: user.IdPersona,
                        Email: user.Email,
                        Nombres: user.Nombres,
                        Apellidos: user.Apellidos,
                        Foto: user.Foto
                    }
                });
            }
            catch (error) {
                console.log('error al login', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
    /* REGISTER NORMAL */
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IdTipoPersona, IdTipoDocumento, NumDocumento, Nombres, Apellidos, Direccion, Referencia, Ciudad, Nacimiento, Email, Foto, Usuario, Password, Estado } = req.body;
            try {
                // 🔍 Verificar si ya existe
                const [rows] = yield database_1.default.query('SELECT * FROM persona WHERE Email = ?', [Email]);
                if (rows.length > 0) {
                    return (0, response_helper_1.errorResponse)(res, 'El Usuario ya Existe', 400);
                }
                // 🔐 Encriptar contraseña
                const hashedPassword = yield bcrypt_1.default.hash(Password, saltRounds);
                // 💾 Insertar usuario
                const [result] = yield database_1.default.query('INSERT INTO persona (IdTipoPersona, IdTipoDocumento, NumDocumento, Nombres, Apellidos, Direccion, Referencia, Ciudad, Nacimiento, Email, Foto, Usuario, Password, Estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [IdTipoPersona, IdTipoDocumento, NumDocumento, Nombres, Apellidos, Direccion, Referencia, Ciudad, Nacimiento, Email, Foto, Usuario, hashedPassword, Estado]);
                const userLog = {
                    IdPersona: result.insertId,
                    Email,
                    Nombres,
                    Apellidos
                };
                // 🔑 Generar tokens (igual que login)
                const accessToken = (0, token_util_1.generateAccessToken)(userLog);
                const refreshToken = (0, token_util_1.generateRefreshToken)(userLog);
                return (0, response_helper_1.successResponse)(res, 'Usuario Creado Correctamente', { accessToken, refreshToken, userLog });
            }
            catch (error) {
                console.log('Error al Guardar Nuevo Usuario', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(403).json({ error: 'No refresh token' });
            }
            try {
                const payload = jsonwebtoken_1.default.verify(refreshToken, refresh);
                const newAccessToken = (0, token_util_1.generateAccessToken)({
                    IdPersona: payload.IdPersona,
                    Email: payload.Email
                });
                res.json({ accessToken: newAccessToken });
            }
            catch (_a) {
                res.status(403).json({ error: 'Refresh token inválido o expirado' });
            }
        });
    }
}
exports.authController = new AuthController();
