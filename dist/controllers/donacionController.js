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
exports.donacionController = void 0;
const database_1 = __importDefault(require("../database"));
const response_helper_1 = require("../helpers/response.helper");
class DonacionController {
    insertDonacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IdFundacion, IdPersona, Tipo_Moneda, Monto, MetodoPago, Mensaje } = req.body;
            const comprobante = req.file ? req.file.path : null;
            try {
                yield database_1.default.query(`
                INSERT INTO donacion (
                    IdFundacion,
                    IdPersona,
                    Tipo_Moneda,
                    Monto,
                    MetodoPago,
                    Mensaje,
                    Comprobante
                )
                VALUES (?,?,?,?,?,?,?)
            `, [IdFundacion, IdPersona || null, Tipo_Moneda, Monto, MetodoPago, Mensaje, comprobante]);
                return (0, response_helper_1.successResponse)(res, 'Donación Registrada Correctamente');
            }
            catch (error) {
                console.log('Inserccion Donacion Fallida', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
    listMetodoDonacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IdFundacion } = req.params;
            try {
                const [list] = yield database_1.default.query('SELECT td.IdTipoDonacion, td.Nombre, td.Icono, td.Req_Datos, fd.Detalle FROM donacionfundacion fd INNER JOIN tipodonacion td ON td.IdTipoDonacion = fd.IdTipoDonacion WHERE fd.IdFundacion = ?;', [IdFundacion]);
                return (0, response_helper_1.successResponse)(res, 'Listado Correctamente', list);
            }
            catch (error) {
                console.log('Error al listar metodos de donacion', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
    listDonacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IdPersona } = req.params;
            try {
                const [list] = yield database_1.default.query('SELECT d.IdDonacion, d.Tipo_Moneda, d.Monto, d.MetodoPago, d.Fecha, d.Estado, f.Nombre   AS Fundacion, f.Img_Principal , f.Ubicacion FROM donacion d INNER JOIN fundacion f ON d.IdFundacion = f.IdFundacion WHERE d.IdPersona = ?', [IdPersona]);
                const Pendientes = list.filter((d) => d.Estado === 'pendiente');
                const Aprobadas = list.filter((d) => d.Estado === 'aprobado');
                const Rechazadas = list.filter((d) => d.Estado === 'rechazado');
                return (0, response_helper_1.successResponse)(res, 'Listado Correctamente', { Pendientes, Aprobadas, Rechazadas, contadores: { pendientes: Pendientes.length, aprobadas: Aprobadas.length, rechazadas: Rechazadas.length } });
            }
            catch (error) {
                console.log('Error en listado de donaciones hechas', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
    getOneDonation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IdPersona, IdDonacion } = req.params;
            try {
                const [list] = yield database_1.default.query('SELECT d.IdDonacion, d.Tipo_Moneda, d.Monto, d.MetodoPago, d.Mensaje, d.Comprobante, d.Fecha, d.Estado, f.Nombre   AS Fundacion, f.Img_Principal , f.Ubicacion FROM donacion d INNER JOIN fundacion f ON d.IdFundacion = f.IdFundacion WHERE d.IdPersona = ? and d.IdDonacion = ?', [IdPersona, IdDonacion]);
                return (0, response_helper_1.successResponse)(res, 'Listado Correctamente', list);
            }
            catch (error) {
                console.log('Error en listado de donaciones unica', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
}
exports.donacionController = new DonacionController();
