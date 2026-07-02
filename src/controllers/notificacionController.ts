import { Request, Response } from "express";
import pool from "../database";
import { errorResponse, successResponse } from "../helpers/response.helper";

class NotificacionController{
    public async listNotificacion(req: Request, res: Response): Promise<any>{
        try{
            const { IdPersona } = req.params;
            const [list] = await pool.query('SELECT n.IdNotificacion, n.IdPersona, n.IdTipoNoficacion, n.Titulo, n.Descripcion, tn.Icono, n.Estado FROM notificacion n INNER JOIN tipo_notificacion tn ON n.IdTipoNoficacion = tn.IdTipoNoficacion WHERE IdPersona = ?', [IdPersona]);
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('Error al listar notificaciones', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }
}

export const notificacionController = new NotificacionController();