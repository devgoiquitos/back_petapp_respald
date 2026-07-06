import { Request, Response } from "express";
import pool from "../database";
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";
import { errorResponse, successResponse } from "../helpers/response.helper";
import { RowDataPacket } from "mysql2";

const saltRounds = 10;

class PersonaController{
    async getPerson (req: Request, res: Response): Promise<any>{
      try{
        const [list] = await pool.query<RowDataPacket[]>("SELECT * FROM persona");
        return successResponse(res, 'Listado Correctamente', list);
      }catch(error){
        console.log('error al listar person');
        return errorResponse(res, 'Error del Servidor');
      }
    }

    async getOnePerson(req: Request, res: Response):Promise<any>{
        const { IdPersona } = req.params;
        try{
          const [list] : any = await pool.query('SELECT * FROM persona WHERE IdPersona = ?' , [IdPersona]);
  
          list[0].Password = '';
          const fecha = new Date(list[0].Nacimiento);
          const fechaFormateada = fecha.toISOString().split('T')[0];
          list[0].Nacimiento = fechaFormateada;

          return successResponse(res, 'Listado Correctamente', list);
        }catch(error){
          console.log('Error al encontrar una persona', error);
          return errorResponse(res, 'Error del Servidor');
        }
    }

    /* editar persona */
    public async editPerson(req: Request, res: Response): Promise<any>{
        const { IdPersona} = req.params;
        const data = req.body;
        
        try {
            if (data.Password) {
                data.Password = await bcrypt.hash(data.Password, saltRounds);
            }else{ delete( data.Password) }

            if (data.Nacimiento){
                const fecha = new Date(data.Nacimiento);
                const fechaFormateada = fecha.toISOString().split('T')[0];
                data.Nacimiento = fechaFormateada;
            }else{ delete(data.Nacimiento) }
            
            await pool.query(
            'UPDATE persona SET ? WHERE IdPersona = ?', [data, IdPersona]
            );

            // Ver si requiere regenerar token 🔐
            const camposToken = ['Email', 'Nombres', 'Apellidos'];
            const requiereToken = camposToken.some(campo => campo in data);

            let accessToken: string | null = null;
            let refreshToken: string | null = null;
            let userLog: any = null;

            if (requiereToken) {
                // Obtener persona actualizada
                const [rows] = await pool.query<RowDataPacket[]>(
                  'SELECT IdPersona, Email, Nombres, Apellidos, Foto FROM persona WHERE IdPersona = ?',
                  [IdPersona]
                );

                if( rows.length === 0 ) return errorResponse(res, 'Persona no encontrada', 404);

                const persona = rows[0];
          
                const payload = {
                  IdPersona: persona.IdPersona,
                  Email: persona.Email,
                };

                userLog = { IdPersona: persona.IdPersona, Email: persona.Email, Nombres: persona.Nombres, Apellidos: persona.Apellidos, Foto: persona.Foto }
          
                accessToken = generateAccessToken(payload);
                refreshToken = generateRefreshToken(payload);
              }
            
            return successResponse(res, 'Usuario Actualizado', {
              accessToken,
              refreshToken,
              userLog
            });
        } catch (error) {
            console.log('Error al Editar Persona', error);
            
            return errorResponse(res, 'Error al Editar Persona');
        }
    }

    /* EDIT PHOTO */
    public async editPhoto(req: any, res: Response) : Promise<any>{
        try {
            const IdPersona = req.user.IdPersona; // o desde token (mejor)
      
          if (!req.file) {
            return errorResponse(res, 'No se envió la imagen', 400);
          }
      
          const filePath = req.file.path; // 🔥 AQUÍ está la ruta real
      
          await pool.query(
            'UPDATE persona SET Foto = ? WHERE IdPersona = ?',
            [filePath, IdPersona]
          );
          
          return successResponse(res, 'Foto Actualizada', { foto: filePath });
      
        } catch (error) {
          console.log('Error al Actualizar foto de Perfil', error);
          return errorResponse(res, 'Error del Servidor');
        }
      }
}

export const personaController = new PersonaController();