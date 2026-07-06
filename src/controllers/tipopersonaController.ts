import { Request, Response } from "express";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";

class TipoPersonaController{
    async getTipoPersona(req: Request, res: Response): Promise<any>{
        try{
            const [list] = await pool.query("SELECT * FROM tipopersona");
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('Error al listar tipo de persona', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }
}

export const tipoPersonaController = new TipoPersonaController();