/**
 * BaseEntity.ts - Clase abstracta base para todas las entidades de dominio
 * 
 * EXPLICACIÓN POO:
 * - HERENCIA: Todas las entidades del dominio heredan propiedades comunes
 * - ABSTRACCIÓN: Modela la identidad esencial de cualquier objeto persistible
 * - ENCAPSULACIÓN: id y createdAt están protegidos contra mutaciones indebidas con readonly
 */

export abstract class BaseEntity<TData = any> {
  readonly id: string;
  readonly createdAt: Date;
  protected _updatedAt?: Date;

  constructor(id: string, createdAt: Date = new Date(), updatedAt?: Date) {
    this.id = id;
    this.createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  /**
   * Método abstracto que toda entidad concreta debe implementar
   * para su serialización segura a JSON
   */
  abstract toJSON(): TData;
}
