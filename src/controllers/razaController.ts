import { Request, Response } from "express";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";


class RazaController{

    public async listRaza(req: Request, res: Response): Promise<any>{
        try{
            const [list] = await pool.query('SELECT * FROM raza');
            return successResponse(res, 'listado Correctamente', list);
        }catch(error){
            console.log('Error al listar razas');
            return errorResponse(res, 'Error del Servidor');
        }
    }
}

export const razaController = new RazaController();