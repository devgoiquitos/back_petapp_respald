import { Request, Response } from "express";
import pool from "../database";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { generateAccessToken, generateRefreshToken } from '../utils/token.util';

/* carga variable de entorno */
import dotenv from 'dotenv';
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { errorResponse, successResponse } from "../helpers/response.helper";
dotenv.config();

const saltRounds = 10;
const refresh = process.env.REFRESH_SECRET!;
const access = process.env.ACCESS_SECRET!;

class AuthController{

    /* LOGIN NORMAL */
    public async login(req: Request, res: Response): Promise<any> {
        const { Email, Password } = req.body;
        
        try {
          
          const [rows]: any = await pool.query('SELECT * FROM persona WHERE Email = ?', [Email]);

          if (rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });
    
          const user = rows[0];

          const match = await bcrypt.compare(Password, user.Password);

          if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });

          const payload = { IdPersona: user.IdPersona, Email: user.Email };
          const accessToken = generateAccessToken(payload);
          const refreshToken = generateRefreshToken(payload);

          res.json({
            message: 'Logeo exitoso',
            accessToken,
            refreshToken,
            userLog:{
              IdPersona: user.IdPersona,
              Email: user.Email,
              Nombres: user.Nombres,
              Apellidos: user.Apellidos,
              Foto: user.Foto
            }
          });
    
        } catch (error) {
          console.log(error);
          
          res.status(500).json({ error: 'Error en el login' });
        }
    }

    /* REGISTER NORMAL */
    public async register(req: Request, res: Response): Promise<any> {
      const { IdTipoPersona, IdTipoDocumento, NumDocumento, Nombres, Apellidos, Direccion, Referencia, Ciudad, Nacimiento, Email, Foto, Usuario, Password, Estado } = req.body;
    
      try {
    
        // 🔍 Verificar si ya existe
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT * FROM persona WHERE Email = ?', 
          [Email]
        );
    
        if (rows.length > 0) {
          return errorResponse(res, 'El Usuario ya Existe', 400);
        }
    
        // 🔐 Encriptar contraseña
        const hashedPassword = await bcrypt.hash(Password, saltRounds);
    
        // 💾 Insertar usuario
        const [result] = await pool.query<ResultSetHeader>(
          'INSERT INTO persona (IdTipoPersona, IdTipoDocumento, NumDocumento, Nombres, Apellidos, Direccion, Referencia, Ciudad, Nacimiento, Email, Foto, Usuario, Password, Estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [IdTipoPersona, IdTipoDocumento, NumDocumento, Nombres, Apellidos, Direccion, Referencia, Ciudad, Nacimiento, Email, Foto, Usuario, hashedPassword, Estado]
          );
    
        const userLog = {
          IdPersona: result.insertId,
          Email,
          Nombres,
          Apellidos
        };
    
        // 🔑 Generar tokens (igual que login)
        const accessToken = generateAccessToken(userLog);
        const refreshToken = generateRefreshToken(userLog);
        
        return successResponse(res, 'Usuario Creado Correctamente', { accessToken, refreshToken, userLog });
    
      } catch (error) {
        console.log('Error al Guardar Nuevo Usuario', error);
        return errorResponse(res, 'Error del Servidor');
      }
    }

    public async refreshToken(req: Request, res: Response): Promise<any>{
      const { refreshToken } = req.body;
    
      if (!refreshToken) {
        return res.status(403).json({ error: 'No refresh token' });
      }
    
      try {
        const payload: any = jwt.verify(refreshToken, refresh);
    
        const newAccessToken = generateAccessToken({
          IdPersona: payload.IdPersona,
          Email: payload.Email
        });
    
        res.json({ accessToken: newAccessToken });
    
      } catch {
        res.status(403).json({ error: 'Refresh token inválido o expirado' });
      }
    }
}

export const authController = new AuthController();