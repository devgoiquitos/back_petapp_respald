import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";

class PublicacionController{
    async newPublicacion(req: Request, res: Response): Promise<any>{
        const { IdPersona, IdPet, TipoPublicacion, Nombre_Contacto, Telefono_Contacto } = req.body;
        try {
            if (!IdPersona || !IdPet || !TipoPublicacion) {
                return errorResponse(res, 'Datos Incompletos', 400);
            }
    
            const [result] = await pool.query<ResultSetHeader>(`
                INSERT INTO publicacion 
                (IdPersona, IdPet, TipoPublicacion, Estado, Nombre_Contacto, Telefono_Contacto)
                VALUES (?, ?, ?, 'pendiente', ?, ?)
            `, [IdPersona, IdPet, TipoPublicacion, Nombre_Contacto, Telefono_Contacto]);
            
            return successResponse(res, 'Registro Guardado', { IdPublicacion: result.insertId });
    
        } catch (error) {
            console.log(res, 'error al guardar publicacion');
            return errorResponse(res, 'Error del Servidor');
        }
    }

    async listPubliAprobadas(req: Request, res: Response): Promise<any>{
        try{
            const [list] = await pool.query(`
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
        
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('error al listar lista de publicacion aprobada', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }

    async AprobarPublicacion(req: Request, res: Response): Promise<any>{
        const { IdPublicacion } = req.params;
        try{
            if (!IdPublicacion) {
                return errorResponse(res, 'Id Requerido', 401);
            }
    
            await pool.query(`UPDATE publicacion
            SET Estado = 'aprobado',
                Fecha_Aprobacion = CURRENT_TIMESTAMP
            WHERE IdPublicacion = ?
            `, [IdPublicacion]);
    
            return successResponse(res, 'Aprobado Correctamente');
        }catch(error){
            console.log('error al aprobar solicitud', error);
            return errorResponse(res, 'Error del Servidor');
        }

    }

    async RechazarPublicacion(req: Request, res: Response):Promise<any>{
        const { IdPublicacion } = req.params;
        try{
            if (!IdPublicacion) {
                return errorResponse(res, 'Id Requerido', 401);
            }
    
            await pool.query(`UPDATE publicacion
            SET Estado = 'rechazado',
                Fecha_Rechazo = CURRENT_TIMESTAMP
            WHERE IdPublicacion = ?
            `, [IdPublicacion]);
    
            return successResponse(res, 'Rechazado Correctamente');
        }catch(error){
            console.log('Error al rechazar publicacion', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }


    /* para listar en un dashboard angular */
    async listPendientes(req: Request, res: Response): Promise<any>{
        try{
            const [list] = await pool.query(`
                SELECT 
                    p.*,
                    m.Nombre,
                    m.Tipo
                FROM publicacion p
                INNER JOIN pet m ON m.IdPet = p.IdPet
                WHERE p.Estado = 'pendiente'
                ORDER BY p.Fecha_Creacion DESC
            `);
        
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('Error listar Publicaciones', error);
            return errorResponse(res, 'error del servidor');
        }
    }
}

export const publicacionController = new PublicacionController();