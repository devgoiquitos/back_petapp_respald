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
exports.publicacionController = void 0;
const database_1 = __importDefault(require("../database"));
const response_helper_1 = require("../helpers/response.helper");
class PublicacionController {
    newPublicacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IdPersona, IdPet, TipoPublicacion, Nombre_Contacto, Telefono_Contacto } = req.body;
            try {
                if (!IdPersona || !IdPet || !TipoPublicacion) {
                    return (0, response_helper_1.errorResponse)(res, 'Datos Incompletos', 400);
                }
                const [result] = yield database_1.default.query(`
                INSERT INTO publicacion 
                (IdPersona, IdPet, TipoPublicacion, Estado, Nombre_Contacto, Telefono_Contacto)
                VALUES (?, ?, ?, 'pendiente', ?, ?)
            `, [IdPersona, IdPet, TipoPublicacion, Nombre_Contacto, Telefono_Contacto]);
                return (0, response_helper_1.successResponse)(res, 'Registro Guardado', { IdPublicacion: result.insertId });
            }
            catch (error) {
                console.log(res, 'error al guardar publicacion');
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
    listPubliAprobadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [list] = yield database_1.default.query(`
                SELECT 
                    p.*,
                    m.Nombre,
                    m.Tipo,
                    m.Edad,
        
                    ma.Estado AS EstadoAdopcion,
                    ma.Vacunas_Completas,
                    ma.Castrado,
        
                    mp.Lugar_Perdida,
                    mp.Fecha_Perdida
        
                FROM publicacion p
                INNER JOIN pet m ON m.IdPet = p.IdPet
        
                LEFT JOIN mascota_adopcion ma ON ma.IdPet = m.IdPet
                LEFT JOIN mascota_perdida mp ON mp.IdPet = m.IdPet
        
                WHERE p.Estado = 'aprobado'
            `);
                return (0, response_helper_1.successResponse)(res, 'Listado Correctamente', list);
            }
            catch (error) {
                console.log('error al listar lista de publicacion aprobada', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
    AprobarPublicacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IdPublicacion } = req.params;
            try {
                if (!IdPublicacion) {
                    return (0, response_helper_1.errorResponse)(res, 'Id Requerido', 401);
                }
                yield database_1.default.query(`UPDATE publicacion
            SET Estado = 'aprobado',
                Fecha_Aprobacion = CURRENT_TIMESTAMP
            WHERE IdPublicacion = ?
            `, [IdPublicacion]);
                return (0, response_helper_1.successResponse)(res, 'Aprobado Correctamente');
            }
            catch (error) {
                console.log('error al aprobar solicitud', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
    RechazarPublicacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IdPublicacion } = req.params;
            try {
                if (!IdPublicacion) {
                    return (0, response_helper_1.errorResponse)(res, 'Id Requerido', 401);
                }
                yield database_1.default.query(`UPDATE publicacion
            SET Estado = 'rechazado',
                Fecha_Rechazo = CURRENT_TIMESTAMP
            WHERE IdPublicacion = ?
            `, [IdPublicacion]);
                return (0, response_helper_1.successResponse)(res, 'Rechazado Correctamente');
            }
            catch (error) {
                console.log('Error al rechazar publicacion', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
    /* para listar en un dashboard angular */
    listPendientes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [list] = yield database_1.default.query(`
                SELECT 
                    p.*,
                    m.Nombre,
                    m.Tipo
                FROM publicacion p
                INNER JOIN pet m ON m.IdPet = p.IdPet
                WHERE p.Estado = 'pendiente'
                ORDER BY p.Fecha_Creacion DESC
            `);
                return (0, response_helper_1.successResponse)(res, 'Listado Correctamente', list);
            }
            catch (error) {
                console.log('Error listar Publicaciones', error);
                return (0, response_helper_1.errorResponse)(res, 'error del servidor');
            }
        });
    }
}
exports.publicacionController = new PublicacionController();
