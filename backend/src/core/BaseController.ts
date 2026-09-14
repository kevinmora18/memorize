/**
 * BaseController.ts - Clase abstracta base para todos los controladores HTTP
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Todos los controladores heredan métodos de respuesta y manejo de errores estandarizados
 * - ABSTRACCIÓN: Oculta los detalles del protocolo HTTP Express en métodos semánticos limpios
 * - SRP: Centraliza el formateo y códigos de respuesta HTTP
 */

import { Response } from 'express';

export abstract class BaseController {
  protected controllerName: string;

  constructor(controllerName: string) {
    this.controllerName = controllerName;
  }

  /**
   * Envía una respuesta exitosa HTTP 200 (o código personalizado)
   */
  protected sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
    res.status(statusCode).json(data);
  }

  /**
   * Envía una respuesta de recurso creado HTTP 201
   */
  protected sendCreated<T>(res: Response, data: T): void {
    res.status(201).json(data);
  }

  /**
   * Envía una respuesta de error controlada
   */
  protected sendError(res: Response, message: string, statusCode: number = 400): void {
    res.status(statusCode).json({ error: message });
  }

  /**
   * Manejador estándar de excepciones de negocio
   */
  protected handleHttpError(res: Response, error: any, defaultMessage: string = 'Error interno'): void {
    const message = error?.message || defaultMessage;
    
    if (message.includes('no encontrado') || message.includes('no encontrada')) {
      res.status(404).json({ error: message });
      return;
    }

    if (message.includes('baneado') || message.includes('Acceso denegado') || message.includes('Solo el host')) {
      res.status(403).json({ error: message });
      return;
    }

    if (message.includes('requerid') || message.includes('inválid') || message.includes('insuficiente') || message.includes('llena')) {
      res.status(400).json({ error: message });
      return;
    }

    console.error(`[${this.controllerName}] Error no controlado:`, error);
    res.status(500).json({ error: message });
  }
}
