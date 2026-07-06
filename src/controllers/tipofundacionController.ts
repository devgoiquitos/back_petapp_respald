import { Request, Response } from "express";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";

class TipoFundacionController{
    public async getTipo(req: Request, res: Response): Promise<any>{
        try{
            const [list] = await pool.query('SELECT * FROM tipofundacion');
            return successResponse(res, 'listado Correctamente', list);
        }catch(error){
            console.log('Error a listar tipo de fundaciones', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }
}
export const tipoFundacionController = new TipoFundacionController()