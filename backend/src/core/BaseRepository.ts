import { PrismaClient } from '@prisma/client';
import { ICrudRepository } from './interfaces/IRepository';

/**
 * BaseRepository - Clase abstracta base para repositorios de datos
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - ABSTRACCIÓN: Separa la persistencia del resto de la lógica de negocio
 * - ENCAPSULACIÓN: Oculta la instancia de base de datos tras métodos protegidos
 * - LSP (Liskov Substitution Principle): Define un contrato uniforme para que
 *   cualquier repositorio derivado pueda sustituir a la clase base sin romper el comportamiento
 * - ISP (Interface Segregation Principle): Implementa ICrudRepository
 * - GENÉRICOS: Tipado seguro para cualquier entidad T con identificador ID
 */
export abstract class BaseRepository<T, ID = string> implements ICrudRepository<T, ID> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Busca una entidad por su identificador único
   */
  abstract findById(id: ID): Promise<T | null>;

  /**
   * Crea una nueva entidad en persistencia
   */
  abstract create(data: Partial<T>): Promise<T>;

  /**
   * Actualiza una entidad existente
   */
  abstract update(id: ID, data: Partial<T>): Promise<T>;

  /**
   * Elimina una entidad por su identificador
   */
  abstract delete(id: ID): Promise<void>;

  /**
   * Lista entidades aplicando opciones opcionales
   */
  abstract findAll(options?: any): Promise<T[]>;

  /**
   * Logging interno protegido
   */
  protected log(message: string): void {
    console.log(`[${this.modelName}Repository] ${message}`);
  }
}
