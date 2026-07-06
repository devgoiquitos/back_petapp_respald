import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";

class FundacionController{
    public async getFundations(req: Request, res: Response): Promise <any>{
        try{
            const [list] = await pool.query<RowDataPacket[]>('SELECT * FROM fundacion');
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('Error al listar Fundaciones', error);
            errorResponse(res, 'Error del Servidor');
        }
    }

    public async getFundationsSelect(req: Request, res: Response): Promise<any>{
        try{
            const [list] = await pool.query<RowDataPacket[]>(`SELECT DISTINCT f.IdFundacion, f.Nombre FROM fundacion f INNER JOIN donacionfundacion df ON df.IdFundacion = f.IdFundacion`);
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('Error de Listado Fundaciones para Select', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }


    public async getOneFundation(req: Request, res: Response): Promise<any>{
        const { IdFundacion } = req.params;
        try {
            const [fundacionRows] = await pool.query<RowDataPacket[]>(
                'SELECT * FROM fundacion WHERE IdFundacion = ?',
                [IdFundacion]
            );
    
            if (fundacionRows.length === 0) {
                return errorResponse(res, 'Fundacion no encontrada', 404);
            }
    
            const [fotosRows] = await pool.query<RowDataPacket[]>(
                'SELECT * FROM fundacion_foto WHERE IdFundacion = ?',
                [IdFundacion]
            );
    
            fundacionRows[0].Fotos = fotosRows;
            
            return successResponse(res, 'Fundacion Encontrada', fundacionRows);    
        } catch (error) {
            console.log('Fundacion Unica', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }
}

export const fundacionController = new FundacionController;