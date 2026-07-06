import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import pool from "../database";
import { successResponse, errorResponse } from "../helpers/response.helper";

class DonacionController{
    async insertDonacion(req: Request, res: Response): Promise<any>{

        const { IdFundacion, IdPersona, Tipo_Moneda, Monto, MetodoPago, Mensaje } = req.body;
    
        const comprobante = req.file ? req.file.path : null;

        try{
            await pool.query(`
                INSERT INTO donacion (
                    IdFundacion,
                    IdPersona,
                    Tipo_Moneda,
                    Monto,
                    MetodoPago,
                    Mensaje,
                    Comprobante
                )
                VALUES (?,?,?,?,?,?,?)
            `,[ IdFundacion, IdPersona || null, Tipo_Moneda, Monto, MetodoPago, Mensaje, comprobante ]);
        
            return successResponse(res, 'Donación Registrada Correctamente')
        }catch(error){
            console.log('Inserccion Donacion Fallida', error);
            return errorResponse(res, 'Error del Servidor');
        }
    
    }

    async listMetodoDonacion(req: Request, res: Response): Promise<any>{
        const { IdFundacion } = req.params;
        try{
            const [ list ] = await pool.query<RowDataPacket[]>('SELECT td.IdTipoDonacion, td.Nombre, td.Icono, td.Req_Datos, fd.Detalle FROM donacionfundacion fd INNER JOIN tipodonacion td ON td.IdTipoDonacion = fd.IdTipoDonacion WHERE fd.IdFundacion = ?;', [ IdFundacion]);
            return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
            console.log('Error al listar metodos de donacion', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }


    async listDonacion(req: Request, res: Response): Promise<any>{
        const { IdPersona } = req.params;
        try{
            const [ list ] : any[] = await pool.query<RowDataPacket[]>('SELECT d.IdDonacion, d.Tipo_Moneda, d.Monto, d.MetodoPago, d.Fecha, d.Estado, f.Nombre   AS Fundacion, f.Img_Principal , f.Ubicacion FROM donacion d INNER JOIN fundacion f ON d.IdFundacion = f.IdFundacion WHERE d.IdPersona = ?', [ IdPersona ]);
            
            const Pendientes = list.filter((d: any) => d.Estado === 'pendiente');
            const Aprobadas  = list.filter((d: any) => d.Estado === 'aprobado');
            const Rechazadas = list.filter((d: any) => d.Estado === 'rechazado');

            return successResponse(res, 'Listado Correctamente', { Pendientes, Aprobadas, Rechazadas, contadores: { pendientes: Pendientes.length, aprobadas: Aprobadas.length, rechazadas: Rechazadas.length } });
        }catch(error){
            console.log('Error en listado de donaciones hechas', error);
            return errorResponse(res, 'Error del Servidor');
        }
    }
}

export const donacionController = new DonacionController();