import { json, Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";

class DoctorController{
    async getDoctorsHome(req: Request, res: Response): Promise<any>{
        const { IdPersona } = req.params;
        try{
            const [list] = await pool.query<RowDataPacket[]>(`
                SELECT 
                    d.IdDoctor,
                    p.Nombres,
                    p.Apellidos,
                    p.Direccion,
                    p.Referencia,
                    p.Foto,
                    d.Presentacion,
                    d.Rating,
        
                    COUNT(c.IdComentario) AS TotalComentarios,
        
                    CASE 
                        WHEN df.IdPersona IS NULL THEN false 
                        ELSE true 
                    END AS IsFavourite
        
                FROM doctor d
        
                INNER JOIN persona p 
                    ON d.IdPersona = p.IdPersona
        
                LEFT JOIN favdoc df 
                    ON d.IdDoctor = df.IdDoctor 
                    AND df.IdPersona = ?
        
                LEFT JOIN comentario c
                    ON d.IdDoctor = c.comentable_id
                    AND c.comentable_typo = 'doctor'
        
                GROUP BY d.IdDoctor
        
            `, [IdPersona]);
        
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('Lista Doctores', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }
    async getDetailDoctor(req: Request, res: Response): Promise<any>{
        const { IdDoctor } = req.params;
        try{
            const [list] = await pool.query<RowDataPacket[]>('SELECT p.IdPersona, d.IdDoctor, p.Nombres, p.Apellidos, p.Direccion, p.Foto, p.Referencia, d.Rating, d.Presentacion FROM `persona` p inner join doctor d on p.IdPersona = d.IdPersona WHERE d.IdDoctor = ?', [IdDoctor]);
            if ( list.length === 0) return errorResponse(res, 'No se encontró el registro', 404);
            return successResponse(res, 'Registro Encontrado', list);
        }catch(error){
            console.log('One Doctor Detail', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }

    async doctorFavorito(req: Request, res: Response): Promise<any> {
        const { IdPersona, IdDoctor } = req.body;
        if( !IdPersona || !IdDoctor){
            return errorResponse(res, 'Se requieres los IDs', 400);
        }
        try{
            const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM favdoc where IdPersona = ? and IdDoctor = ?', [IdPersona, IdDoctor]);
            if ( rows.length > 0){
                await pool.query('DELETE FROM favdoc where IdPersona = ? and IdDoctor = ?', [IdPersona, IdDoctor]);
                return successResponse(res, 'Eliminado Correctamente'); 
            }else{
                await pool.query('INSERT INTO favdoc (IdPersona, IdDoctor) values (?,?)', [IdPersona, IdDoctor]);
                return successResponse(res, 'Marcado como Favorito');
            }
        }catch(error){
            console.error('Error en doctorFavorito:', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }
}

export const doctorController = new DoctorController(); 