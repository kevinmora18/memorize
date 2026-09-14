import { PrismaClient, Match as PrismaMatch } from '@prisma/client';
import { BaseRepository } from '../core/BaseRepository';
import { IMatchRepository } from '../core/interfaces/IRepository';
import { Match, IMatch } from '../models/domain/Match.model';

/**
 * MatchRepository - Repositorio para operaciones de partidas
 *
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseRepository<Match, string>
 * - LSP (Liskov Substitution Principle): Satisface rigurosamente las firmas de create y update
 *   de BaseRepository con Partial<Match | IMatch>, garantizando total sustituibilidad polimórfica
 * - ISP: Implementa la interfaz específica IMatchRepository
 * - SRP: Maneja únicamente el acceso a datos de partidas
 */
export class MatchRepository extends BaseRepository<Match, string> implements IMatchRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Match');
  }

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

  /**
   * LSP: Acepta Partial<Match | IMatch> según contrato de BaseRepository
   */
  async create(data: Partial<Match | IMatch>): Promise<Match> {
    if (!data.userId || !data.mode) {
      throw new Error('userId y mode son requeridos para crear una partida');
    }

    this.log(`Creando partida para usuario: ${data.userId}`);
    const match = await this.prisma.match.create({
      data: {
        userId: data.userId,
        mode: data.mode,
        level: data.level ?? undefined,
        score: data.score ?? 0,
        accuracy: data.accuracy ?? undefined,
        combo: data.combo ?? undefined,
        timeLeft: data.timeLeft ?? undefined,
        won: data.won ?? false,
      },
    });
    return this.toDomain(match);
  }

  /**
   * LSP: Acepta cualquier campo mutable de Partial<Match | IMatch>
   */
  async update(id: string, data: Partial<Match | IMatch>): Promise<Match> {
    this.log(`Actualizando partida: ${id}`);
    const match = await this.prisma.match.update({
      where: { id },
      data: {
        ...(data.score !== undefined && { score: data.score }),
        ...(data.won !== undefined && { won: data.won }),
        ...(data.accuracy !== undefined && { accuracy: data.accuracy }),
        ...(data.combo !== undefined && { combo: data.combo }),
        ...(data.timeLeft !== undefined && { timeLeft: data.timeLeft }),
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

  async getBestScoresByMode(mode: string, limit: number = 100): Promise<Match[]> {
    this.log(`Obteniendo mejores puntuaciones para modo: ${mode}`);
    const matches = await this.prisma.match.findMany({
      where: { mode },
      orderBy: { score: 'desc' },
      take: limit,
    });
    return matches.map(m => this.toDomain(m));
  }

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
