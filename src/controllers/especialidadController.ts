import { Request, Response } from "express";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";

class EspecialidadController{
    async listEspecialidad(req: Request, res: Response): Promise<any>{
        try{
            const [list] = await pool.query('SELECT * FROM especialidad');
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('Error al listar las especialidades del doctor', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }
}

export const especialidadController = new EspecialidadController(); 