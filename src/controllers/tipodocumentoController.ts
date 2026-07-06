import { Request, Response } from "express";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";

class TipoDocumentoController{

    async getTipoDocumento(req: Request, res: Response):Promise<any>{
        try{
            const [list] = await pool.query("SELECT * FROM tipodocumento");
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('Error al lsitar documentos', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }
}


export const tipoDocumentoController = new TipoDocumentoController();