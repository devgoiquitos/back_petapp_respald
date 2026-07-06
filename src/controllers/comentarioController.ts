import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";
import { IPromedioComentario, ITablaComentario } from "../interfaces/tablaComentario.interface";

class ComentarioController{
    /* COMENTARIOS HACIA EL DOCTOR */
    async getComentarioDoctor(req: Request, res: Response): Promise<any>{
        const { IdDoctor } = req.params;
        try{
            const [list] = await pool.query<RowDataPacket[]>('SELECT c.IdComentario, c.IdPersona, p.Nombres, p.Apellidos, p.Foto, c.Titulo, c.Descripcion, c.Rating, c.Fecha, c.comentable_id, c.comentable_typo, c.Estado FROM comentario c INNER JOIN persona p ON c.IdPersona = p.IdPersona WHERE comentable_typo = ? AND comentable_id = ?', ['doctor', IdDoctor]);
            return successResponse(res, 'Lista Correcta', list);
        }catch(error){
            console.log('Listado Comenatario Doctor', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }

    public async createComentario(req: Request, res: Response): Promise<any> {

        const { IdPersona, Titulo, Descripcion, Rating, comentable_id, comentable_typo } = req.body;
    
        if (!IdPersona || !Descripcion || !Rating || !comentable_id || !comentable_typo) {
            return errorResponse(res, 'Datos incompletos', 400);
        }
    
        const tablasValidas: Record<string, ITablaComentario> = {
            doctor: {
                tabla: 'doctor',
                id: 'IdDoctor'
            },
            veterinaria: {
                tabla: 'veterinaria',
                id: 'IdVeterinaria'
            },
            fundacion: {
                tabla: 'fundacion',
                id: 'IdFundacion'
            }
        };
    
        const config = tablasValidas[comentable_typo];
    
        if (!config) {
            return errorResponse(res, 'Tipo inválido', 400);
        }
        const conn = await pool.getConnection();
    
        try {
            await conn.beginTransaction();
    
            // 1. Insertar comentario
            await conn.query(
                `INSERT INTO comentario
                (IdPersona, Titulo, Descripcion, Rating, Fecha, comentable_id, comentable_typo, Estado)
                VALUES (?, ?, ?, ?, NOW(), ?, ?, 1)`,
                [ IdPersona, Titulo, Descripcion, Rating, comentable_id, comentable_typo ]
            );
    
            // 2. Calcular promedio
            const [rows] = await conn.query<IPromedioComentario[]>(
                `SELECT ROUND(AVG(Rating),1) AS promedio
                 FROM comentario
                 WHERE comentable_typo = ?
                 AND comentable_id = ?`,
                [comentable_typo, comentable_id]
            );
    
            const promedio = rows[0]?.promedio ?? 0;
    
            // 3. Actualizar rating
            await conn.query(
                `UPDATE ${config.tabla}
                 SET Rating = ?
                 WHERE ${config.id} = ?`,
                [promedio, comentable_id]
            );
    
            await conn.commit();
            return successResponse(res, 'Creado correctamente', { promedio });
        } catch (error) {

            await conn.rollback();
            console.error('createComentario:', error);
            return errorResponse(res, 'Error en el servidor', 500);
        } finally {
            conn.release();
        }
    }

    /* COMENTARIOS HACIA LA VETERINARIA */
    async getComentarioVet(req: Request, res: Response): Promise<any>{
        const { IdVeterinaria } = req.params;
        try{
            const [list] = await pool.query<RowDataPacket[]>('SELECT c.IdComentario, c.IdPersona, p.Nombres, p.Apellidos, p.Foto, c.Titulo, c.Descripcion, c.Rating, c.Fecha, c.comentable_id, c.comentable_typo, c.Estado FROM comentario c INNER JOIN persona p ON c.IdPersona = p.IdPersona WHERE comentable_typo = ? AND comentable_id = ?', ['veterinaria', IdVeterinaria]);
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('Error al obtener los comentarios de la veterinaria', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }

    /* COMENTARIOS HACIA LA FUNDACION */
async getComentarioFundacion(req: Request, res: Response): Promise<any>{
    const { IdFundacion } = req.params;
    try{
        const [list] = await pool.query<RowDataPacket[]>(
            `SELECT 
                c.IdComentario, 
                c.IdPersona, 
                p.Nombres, 
                p.Apellidos, 
                p.Foto, 
                c.Titulo, 
                c.Descripcion, 
                c.Rating, 
                c.Fecha, 
                c.comentable_id, 
                c.comentable_typo, 
                c.Estado 
            FROM comentario c 
            INNER JOIN persona p ON c.IdPersona = p.IdPersona 
            WHERE c.comentable_typo = ? 
              AND c.comentable_id = ?`,
            ['fundacion', IdFundacion]
        );
        return successResponse(res, 'Lista Correcta', list); 
    }catch(error){
        console.log('Listado Comentario Fundacion', error);
        return errorResponse(res, 'Error del Servidor');
    }

}

}

export const comentarioController = new ComentarioController();