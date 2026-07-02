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
exports.personaController = void 0;
const database_1 = __importDefault(require("../database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_util_1 = require("../utils/token.util");
const response_helper_1 = require("../helpers/response.helper");
const saltRounds = 10;
class PersonaController {
    getPerson(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [list] = yield database_1.default.query("SELECT * FROM persona");
                return (0, response_helper_1.successResponse)(res, 'Listado Correctamente', list);
            }
            catch (error) {
                console.log('error al listar person');
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
    getOnePerson(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IdPersona } = req.params;
            try {
                const [list] = yield database_1.default.query('SELECT * FROM persona WHERE IdPersona = ?', [IdPersona]);
                list[0].Password = '';
                const fecha = new Date(list[0].Nacimiento);
                const fechaFormateada = fecha.toISOString().split('T')[0];
                list[0].Nacimiento = fechaFormateada;
                return (0, response_helper_1.successResponse)(res, 'Listado Correctamente', list);
            }
            catch (error) {
                console.log('Error al encontrar una persona', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
    /* editar persona */
    editPerson(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IdPersona } = req.params;
            const data = req.body;
            try {
                if (data.Password) {
                    data.Password = yield bcrypt_1.default.hash(data.Password, saltRounds);
                }
                else {
                    delete (data.Password);
                }
                if (data.Nacimiento) {
                    const fecha = new Date(data.Nacimiento);
                    const fechaFormateada = fecha.toISOString().split('T')[0];
                    data.Nacimiento = fechaFormateada;
                }
                else {
                    delete (data.Nacimiento);
                }
                yield database_1.default.query('UPDATE persona SET ? WHERE IdPersona = ?', [data, IdPersona]);
                // Ver si requiere regenerar token 🔐
                const camposToken = ['Email', 'Nombres', 'Apellidos'];
                const requiereToken = camposToken.some(campo => campo in data);
                let accessToken = null;
                let refreshToken = null;
                let userLog = null;
                if (requiereToken) {
                    // Obtener persona actualizada
                    const [rows] = yield database_1.default.query('SELECT IdPersona, Email, Nombres, Apellidos, Foto FROM persona WHERE IdPersona = ?', [IdPersona]);
                    if (rows.length === 0)
                        return (0, response_helper_1.errorResponse)(res, 'Persona no encontrada', 404);
                    const persona = rows[0];
                    const payload = {
                        IdPersona: persona.IdPersona,
                        Email: persona.Email,
                    };
                    userLog = { IdPersona: persona.IdPersona, Email: persona.Email, Nombres: persona.Nombres, Apellidos: persona.Apellidos, Foto: persona.Foto };
                    accessToken = (0, token_util_1.generateAccessToken)(payload);
                    refreshToken = (0, token_util_1.generateRefreshToken)(payload);
                }
                return (0, response_helper_1.successResponse)(res, 'Usuario Actualizado', {
                    accessToken,
                    refreshToken,
                    userLog
                });
            }
            catch (error) {
                console.log('Error al Editar Persona', error);
                return (0, response_helper_1.errorResponse)(res, 'Error al Editar Persona');
            }
        });
    }
    /* EDIT PHOTO */
    editPhoto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const IdPersona = req.user.IdPersona; // o desde token (mejor)
                if (!req.file) {
                    return (0, response_helper_1.errorResponse)(res, 'No se envió la imagen', 400);
                }
                const filePath = req.file.path; // 🔥 AQUÍ está la ruta real
                yield database_1.default.query('UPDATE persona SET Foto = ? WHERE IdPersona = ?', [filePath, IdPersona]);
                return (0, response_helper_1.successResponse)(res, 'Foto Actualizada', { foto: filePath });
            }
            catch (error) {
                console.log('Error al Actualizar foto de Perfil', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
}
exports.personaController = new PersonaController();
