import e, { Request, Response } from "express";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";

class ColorController{
    public async listColor(req: Request, res: Response): Promise<any>{
        try{
            const [list] = await pool.query('SELECT * FROM color');
            return successResponse(res, 'Listado Corretcamente', list);
        }catch(error){
            console.log('Error al listar colores', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }
}
export const colorController = new ColorController();