import { Request, Response } from "express";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";

class BannerController{
    public async getListBanners(req: Request, res: Response): Promise<any>{
        try{
            const [ list ] = await pool.query('SELECT * FROM banner WHERE Estado = 1 AND NOW() BETWEEN FechaInicio AND FechaFin ORDER BY OrdenMostrar ASC LIMIT 5;');
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('Error al listar los banners', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }
}

export const bannerController = new BannerController();