import { PrismaClient, Match as PrismaMatch } from '@prisma/client';
import { BaseRepository } from '../core/BaseRepository';
import { Match, IMatch } from '../models/domain/Match.model';

/**
 * MatchRepository - Repositorio para operaciones de partidas
 *
 * EXPLICACIÓN POO:
 * - HERENCIA: Extiende BaseRepository
 * - POLIMORFISMO: Implementa métodos abstractos de BaseRepository
 * - ENCAPSULACIÓN: Oculta Prisma detrás de métodos simples
 * - SRP: Solo maneja acceso a datos de partidas
 */
export class MatchRepository extends BaseRepository<Match, string> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Match');
  }

  /**
   * Convierte registro Prisma a modelo de dominio
   */
  private toDomain(prismaMatch: PrismaMatch): Match {
    return new Match({
      id: prismaMatch.id,
      userId: prismaMatch.userId,
      mode: prismaMatch.mode,
      level: prismaMatch.level,
      score: prismaMatch.score,
      accuracy: prismaMatch.accuracy,
      combo: prismaMatch.combo,
      timeLeft: prismaMatch.timeLeft,
      won: prismaMatch.won,
      createdAt: prismaMatch.createdAt,
    });
  }

  async findById(id: string): Promise<Match | null> {
    this.log(`Buscando partida por ID: ${id}`);
    const match = await this.prisma.match.findUnique({ where: { id } });
    return match ? this.toDomain(match) : null;
  }

  async create(data: Omit<IMatch, 'id' | 'createdAt'>): Promise<Match> {
    this.log(`Creando partida para usuario: ${data.userId}`);
    const match = await this.prisma.match.create({
      data: {
        userId: data.userId,
        mode: data.mode,
        level: data.level ?? undefined,
        score: data.score,
        accuracy: data.accuracy ?? undefined,
        combo: data.combo ?? undefined,
        timeLeft: data.timeLeft ?? undefined,
        won: data.won,
      },
    });
    return this.toDomain(match);
  }

  async update(id: string, data: Partial<IMatch>): Promise<Match> {
    this.log(`Actualizando partida: ${id}`);
    const match = await this.prisma.match.update({
      where: { id },
      data: {
        score: data.score,
        won: data.won,
      },
    });
    return this.toDomain(match);
  }

  async delete(id: string): Promise<void> {
    this.log(`Eliminando partida: ${id}`);
    await this.prisma.match.delete({ where: { id } });
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    userId?: string;
    mode?: string;
  }): Promise<Match[]> {
    this.log('Listando partidas');
    const where: any = {};
    if (options?.userId) where.userId = options.userId;
    if (options?.mode) where.mode = options.mode;

    const matches = await this.prisma.match.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
    });
    return matches.map(m => this.toDomain(m));
  }

  async count(where?: { userId?: string; mode?: string }): Promise<number> {
    return this.prisma.match.count({ where });
  }

  /**
   * Obtener las mejores puntuaciones por modo
   */
  async getBestScoresByMode(mode: string, limit: number = 100): Promise<Match[]> {
    this.log(`Obteniendo mejores puntuaciones para modo: ${mode}`);
    const matches = await this.prisma.match.findMany({
      where: { mode },
      orderBy: { score: 'desc' },
      take: limit,
    });
    return matches.map(m => this.toDomain(m));
  }

  /**
   * Obtener partidas en un rango de fechas
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Match[]> {
    this.log(`Buscando partidas entre ${startDate.toISOString()} y ${endDate.toISOString()}`);
    const matches = await this.prisma.match.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    });
    return matches.map(m => this.toDomain(m));
  }
}
