import { Request, Response } from "express";
import pool from "../database";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { errorResponse, successResponse } from "../helpers/response.helper";

class AdopcionController{
  async setStateAdoption(req: Request, res: Response): Promise<any> {
    const { IdPersona, IdMascotaAdopcion, Mensaje } = req.body;
    
    const conn = await pool.getConnection();
  
    try {
      await conn.beginTransaction(); // ✅ CORRECTO
  
      // 🔹 1. Validar duplicado
      const [existe] = await conn.query<RowDataPacket[]>(`
        SELECT * 
        FROM solicitud_adopcion 
        WHERE IdPersona = ? AND IdMascotaAdopcion = ?
      `,[IdPersona, IdMascotaAdopcion]);
  
      if(existe.length > 0){
        await conn.rollback();
        return errorResponse(res, 'Ya Existe una solicitud para esta mascota', 409);
      }
  
      // 🔹 2. Validar estado mascota
      const [estadoMascota] = await conn.query<RowDataPacket[]>(`
        SELECT Estado
        FROM mascota_adopcion
        WHERE IdMascotaAdopcion = ?
      `,[IdMascotaAdopcion]);
  
      if(!estadoMascota.length){
        await conn.rollback();
        return errorResponse(res, 'Mascota no encontrada', 404);
      }
  
      if(estadoMascota[0].Estado === 'Adoptado'){
        await conn.rollback();
        return errorResponse(res, 'Las Mascota ya fue Adoptada', 409);
      }
  
      // 🔹 3. Insertar solicitud
      const [result] = await conn.query<ResultSetHeader>(`
        INSERT INTO solicitud_adopcion 
        (IdPersona, IdMascotaAdopcion, Fecha_Solicitud, Estado_Solicitud, Mensaje) 
        VALUES (?, ?, NOW(), 'Pendiente', ?)
      `,[IdPersona, IdMascotaAdopcion, Mensaje]);
  
      const IdSolicitud = result.insertId;
  
      // 🔹 4. Insertar historial
      await conn.query(`
        INSERT INTO adopcion_historial
        (IdSolicitud, EstadoAnterior, EstadoNuevo, FechaCambio)
        VALUES (?, NULL, 'Pendiente', NOW())
      `,[IdSolicitud]);
  
      await conn.commit();
      
      return successResponse(res, 'Solicitud Enviada Correctamente', { IdSolicitud });
  
    } catch (error: any) {
  
      console.error('Adoption Solicitud:', error);
  
      await conn.rollback();

      return errorResponse(res, 'Error interno del servidor');
  
    } finally {
  
      conn.release();
  
    }
  }

  async listAdoption(req: Request, res: Response): Promise<any>{
      const { IdPersona } = req.params;
      try{
        const [ list ] = await pool.query< RowDataPacket[]>(`SELECT sa.IdSolicitud, sa.Estado_Solicitud, sa.Fecha_Solicitud, p.Nombre, tm.Descripcion AS Tipo, r.Descripcion AS Raza, c.Descripcion AS Color, p.Foto 
        FROM solicitud_adopcion sa
        INNER JOIN mascota_adopcion ma 
          ON sa.IdMascotaAdopcion = ma.IdMascotaAdopcion
        INNER JOIN pet p
          ON ma.IdPet = p.IdPet
        INNER JOIN tipomascota tm
          ON p.IdTipoMascota = tm.IdTipoMascota
        INNER JOIN raza r
          ON p.IdRaza = r.IdRaza
        INNER JOIN color c
          ON p.IdColor = c.IdColor
        WHERE sa.IdPersona = ?
        ORDER BY sa.Fecha_Solicitud DESC;`,  [IdPersona]);
        return successResponse(res, 'Listado Correctamente', list);
      }catch(error){
        console.log('Error al listar mascotas en espera', error);
        return errorResponse(res, 'error del Servidor');
      }
  }
  
  async actualizarEstadoSolicitud(req: Request, res: Response): Promise<any>{

    const { IdSolicitud, EstadoNuevo } = req.body;
  
    const conn = await pool.getConnection();
  
    try{
  
      await conn.beginTransaction();
  
      // 1. obtener estado actual
      const [rows] = await conn.query<RowDataPacket[]>(`
        SELECT Estado, IdMascotaAdopcion, IdPersona
        FROM solicitud_adopcion
        WHERE IdSolicitud = ?
      `,[IdSolicitud]);
  
      const solicitud = rows[0];
  
      const estadoAnterior = solicitud.Estado;
  
      // 2. actualizar estado
      await conn.query<ResultSetHeader>(`
        UPDATE solicitud_adopcion
        SET Estado = ?
        WHERE IdSolicitud = ?
      `,[EstadoNuevo, IdSolicitud]);
  
      // 3. guardar historial
      await conn.query(`
        INSERT INTO adopcion_historial
        (IdSolicitud, EstadoAnterior, EstadoNuevo, FechaCambio)
        VALUES (?, ?, ?, NOW())
      `,[IdSolicitud, estadoAnterior, EstadoNuevo]);
  
      await conn.commit();
      
      return successResponse(res, 'Cambiado Correctamente');
    }catch(error){
      await conn.rollback();
      console.log('Error al cambiar de estado', error);
      return errorResponse(res, 'Error del Servidor');
    }finally{
      conn.release();
    }
  
  }
}

export const adopcionController = new AdopcionController();