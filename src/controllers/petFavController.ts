import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";

class PetFavController{
    async getFavPet(req: Request, res: Response): Promise<any>{
        const { IdPersona } = req.params;
        try{
            const [list] = await pool.query('SELECT m.IdPet, m.Nombre, m.Apellidos, m.Tipo, m.Edad, m.Peso, m.Foto, f.Fecha FROM favpet f INNER JOIN pet m ON f.IdPet = m.IdPet WHERE f.IdPersona = ? ORDER BY m.Tipo, f.Fecha DESC', [IdPersona]);
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('Error al listar mascotas favoritas', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }

    /* pet fav */
    async petFav(req: Request, res: Response): Promise<any> {
        const { IdPersona, IdPet } = req.body;
    
        if (!IdPersona || !IdPet) {
            return errorResponse(res, 'Se Requiere IdPersona e IdMascota', 400);
        }
    
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                'SELECT * FROM favpet WHERE IdPersona = ? AND IdPet = ?',
                [IdPersona, IdPet]
            );
    
            if (rows.length > 0) {
                await pool.query(
                    'DELETE FROM favpet WHERE IdPersona = ? AND IdPet = ?',
                    [IdPersona, IdPet]
                );
                
                return successResponse(res, 'Eliminado de Favoritos', { favorite: false });
    
            } else {
                await pool.query(
                    'INSERT INTO favpet (IdPersona, IdPet) VALUES (?, ?)',
                    [IdPersona, IdPet]
                );
                
                return successResponse(res, 'Marcado como favorito', { favorite: true })
            }
    
        } catch (error) {
            console.log('petfav', error);
            return errorResponse(res, 'Error Interno');
        }
    }
    
}

export const petFavController = new PetFavController();