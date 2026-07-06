import { Request, Response } from "express";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";

class TipoMascotaController{
    public async listTipoMascota(req: Request, res: Response): Promise<any>{
        try{
            const [list] = await pool.query('SELECT * FROM tipomascota');
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('Error al listar tipo mascotas', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }
}

export const tipoMascotaController = new TipoMascotaController();