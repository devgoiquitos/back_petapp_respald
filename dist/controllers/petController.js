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
exports.petController = void 0;
const database_1 = __importDefault(require("../database"));
const response_helper_1 = require("../helpers/response.helper");
class PetController {
    /* pet lost */
    listPetOneLost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IdPersona, IdPet } = req.params;
            try {
                const [list] = yield database_1.default.query(`
        SELECT 
          p.IdPet,
          p.Nombre,
          p.Apellidos,
          tm.Descripcion AS Tipo,
          r.Descripcion AS Raza,
          c.Descripcion AS Color,
          p.Edad,
          p.Peso,
          p.Medida,
          p.Foto,
          p.Detalle,
    
          mp.Descripcion,
          mp.Lugar_Perdida,
          mp.Ciudad,
          mp.Fecha_Perdida,
          mp.Referencia,
    
          -- 🔥 contacto (nuevo)
          pub.Nombre_Contacto,
          COALESCE(pub.Telefono_Contacto, mp.Numero_Contacto) AS Telefono_Contacto,
    
          CASE 
            WHEN fp.IdPet IS NULL THEN 0 
            ELSE 1 
          END AS EsFavorito
    
        FROM pet p
        INNER JOIN mascota_perdida mp ON p.IdPet = mp.IdPet
        INNER JOIN tipomascota tm ON p.IdTipoMascota = tm.IdTipoMascota
        INNER JOIN raza r ON p.IdRaza = r.IdRaza
        INNER JOIN color c ON p.IdColor = c.IdColor
    
        -- 🔥 NUEVO
        INNER JOIN publicacion pub 
          ON pub.IdPet = p.IdPet
    
        LEFT JOIN favpet fp
          ON fp.IdPet = p.IdPet 
          AND fp.IdPersona = ?
    
        WHERE p.IdPet = ?
        AND pub.TipoPublicacion = 'perdido'
        AND pub.Estado = 'aprobado'
    
        LIMIT 1;
      `, [IdPersona, IdPet]);
                // 🧼 formateo fecha (más limpio)
                if (list.length > 0 && list[0].Fecha_Perdida) {
                    const fecha = new Date(list[0].Fecha_Perdida);
                    list[0].Fecha_Perdida = fecha.toISOString().split('T')[0];
                }
                return (0, response_helper_1.successResponse)(res, 'Listado Correctamente', list);
            }
            catch (error) {
                console.log('Error al obtener una mascota perdida', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
    listPetLost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IdPersona } = req.params;
            try {
                const [list] = yield database_1.default.query(`
        SELECT 
          p.IdPet,
          p.Nombre,
          p.Apellidos,
          p.Foto,
          tm.Descripcion AS Tipo,
    
          mp.Lugar_Perdida,
          mp.Ciudad,
          mp.Referencia,
    
          pub.Nombre_Contacto,
          pub.Telefono_Contacto,
    
          CASE 
            WHEN fp.IdPet IS NULL THEN 0 
            ELSE 1 
          END AS EsFavorito
    
        FROM pet p
    
        INNER JOIN mascota_perdida mp ON p.IdPet = mp.IdPet
        INNER JOIN tipomascota tm ON p.IdTipoMascota = tm.IdTipoMascota
    
        -- 🔥 NUEVO
        INNER JOIN publicacion pub 
          ON pub.IdPet = p.IdPet
    
        LEFT JOIN favpet fp
          ON fp.IdPet = p.IdPet
          AND fp.IdPersona = ?
    
        WHERE pub.TipoPublicacion = 'perdido'
        AND pub.Estado = 'aprobado'
      `, [IdPersona]);
                return (0, response_helper_1.successResponse)(res, 'Listado Correctamente', list);
            }
            catch (error) {
                console.log('Error al listar mascotas perdidas disponibles', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
    listPetAdoption(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { IdPersona } = req.params;
                const [list] = yield database_1.default.query(`
        SELECT 
        p.IdPet,
        p.Nombre,
        p.Apellidos,
        p.Foto,
        tm.Descripcion AS TipoMascota,
        p.Edad,
        p.Peso,
        
        ma.Estado,
        ma.Fecha_Registro,
        ma.Lugar_Entrega,
        ma.Vacunas_Completas,
        ma.Castrado,
        ma.Tipo_Adopcion,
        ma.Costo_Adopcion,
        ma.Contacto,
        ma.Descripcion AS Detalle_Adopcion,
  
        pub.Nombre_Contacto,
        pub.Telefono_Contacto
  
      FROM pet p
  
      INNER JOIN mascota_adopcion ma ON p.IdPet = ma.IdPet
      INNER JOIN tipomascota tm ON p.IdTipoMascota = tm.IdTipoMascota
  
      -- 🔥 NUEVO
      INNER JOIN publicacion pub 
        ON pub.IdPet = p.IdPet
  
      WHERE pub.TipoPublicacion = 'adopcion'
      AND pub.Estado = 'aprobado'
      AND ma.Estado = 'Disponible'
  
      AND ma.IdMascotaAdopcion NOT IN (
        SELECT IdMascotaAdopcion
        FROM solicitud_adopcion
        WHERE IdPersona = ?
      );
      `, [IdPersona]);
                return (0, response_helper_1.successResponse)(res, 'Listado Correcto', list);
            }
            catch (error) {
                console.log('Error List Adoption', error);
                return (0, response_helper_1.errorResponse)(res, 'Error en el Servidor');
            }
        });
    }
    listPetOneAdoption(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { IdPersona, IdPet } = req.params;
                const [list] = yield database_1.default.query(`
        SELECT 
        p.IdPet,
        p.Nombre,
        p.Apellidos,
        p.Foto,
        tm.Descripcion AS TipoMascota,
        p.Edad,
        p.Peso,
        
        ma.IdMascotaAdopcion,
        ma.Estado,
        ma.Fecha_Registro,
        ma.Lugar_Entrega,
        ma.Vacunas_Completas,
        ma.Castrado,
        ma.Tipo_Adopcion,
        ma.Costo_Adopcion,
        ma.Contacto,
        ma.Descripcion AS Detalle_Adopcion,

        pub.Nombre_Contacto,
        pub.Telefono_Contacto,
        pub.Relacion,

        CASE 
          WHEN mf.IdPet IS NULL THEN false
          ELSE true
        END AS EsFavorito

      FROM pet p

      INNER JOIN mascota_adopcion ma ON p.IdPet = ma.IdPet
      INNER JOIN tipomascota tm ON p.IdTipoMascota = tm.IdTipoMascota

      LEFT JOIN favpet mf 
        ON mf.IdPet = p.IdPet AND mf.IdPersona = ?

      -- 🔥 NUEVO JOIN
      INNER JOIN publicacion pub 
        ON pub.IdPet = p.IdPet 
        AND pub.TipoPublicacion = 'adopcion'
        AND pub.Estado = 'aprobado'

      WHERE p.Tipo = 'adopcion'
      AND p.IdPet = ?
      LIMIT 1;
    `, [IdPersona, IdPet]);
                if (list.length === 0)
                    return (0, response_helper_1.errorResponse)(res, 'Mascota no encontrada', 404);
                return (0, response_helper_1.successResponse)(res, 'Todo Ok', list);
            }
            catch (error) {
                console.log('List PetOne Adoption', error);
                return (0, response_helper_1.errorResponse)(res, 'Error interno del servidor');
            }
        });
    }
    listMyAdoptions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { IdPersona } = req.params;
                const [list] = yield database_1.default.query(`SELECT sa.IdSolicitud, sa.Estado_Solicitud, sa.Fecha_Solicitud, p.Nombre, p.Apellidos, p.Edad, p.Foto,
      tm.Descripcion AS TipoMascota, p.Peso
      
      FROM solicitud_adopcion sa
      
      INNER JOIN mascota_adopcion ma 
        ON sa.IdMascotaAdopcion = ma.IdMascotaAdopcion
      
      INNER JOIN pet p 
        ON ma.IdPet = p.IdPet
      
      INNER JOIN tipomascota tm 
        ON p.IdTipoMascota = tm.IdTipoMascota
      
      WHERE sa.IdPersona = ?
      
      ORDER BY sa.Fecha_Solicitud DESC;`, [IdPersona]);
                return (0, response_helper_1.successResponse)(res, 'Listado Correctamente', list);
            }
            catch (error) {
                console.log('Error Lista My Adoption', error);
                return (0, response_helper_1.errorResponse)(res, 'Error del Servidor');
            }
        });
    }
}
exports.petController = new PetController();
