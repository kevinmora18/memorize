import { PrismaClient, PlayerStats as PrismaPlayerStats } from '@prisma/client';
import { BaseRepository } from '../core/BaseRepository';
import { IPlayerStatsRepository } from '../core/interfaces/IRepository';
import { PlayerStats, IPlayerStats } from '../models/domain/PlayerStats.model';

/**
 * PlayerStatsRepository - Repositorio para estadísticas de jugadores
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseRepository<PlayerStats, string>
 * - ISP: Implementa la interfaz específica IPlayerStatsRepository
 * - LSP: Respeta la sustituibilidad de BaseRepository
 * - SRP: Solo maneja persistencia de estadísticas
 */
export class PlayerStatsRepository extends BaseRepository<PlayerStats, string> implements IPlayerStatsRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'PlayerStats');
  }

  private toDomain(prismaStats: PrismaPlayerStats): PlayerStats {
    return new PlayerStats({
      id: prismaStats.id,
      userId: prismaStats.userId,
      gamesPlayed: prismaStats.gamesPlayed,
      gamesWon: prismaStats.gamesWon,
      totalScore: prismaStats.totalScore,
      bestScore: prismaStats.bestScore,
      totalMatches: prismaStats.totalMatches,
      perfectMatches: prismaStats.perfectMatches,
      maxCombo: prismaStats.maxCombo,
      createdAt: prismaStats.createdAt,
      updatedAt: prismaStats.updatedAt,
    });
  }

  async findById(id: string): Promise<PlayerStats | null> {
    this.log(`Buscando estadísticas por ID: ${id}`);
    const stats = await this.prisma.playerStats.findUnique({
      where: { id },
    });
    return stats ? this.toDomain(stats) : null;
  }

  async findByUserId(userId: string): Promise<PlayerStats | null> {
    this.log(`Buscando estadísticas del usuario: ${userId}`);
    const stats = await this.prisma.playerStats.findUnique({
      where: { userId },
    });
    return stats ? this.toDomain(stats) : null;
  }

  async create(data: Partial<PlayerStats | IPlayerStats>): Promise<PlayerStats> {
    this.log(`Creando estadísticas para usuario: ${data.userId}`);
    const stats = await this.prisma.playerStats.create({
      data: {
        userId: data.userId!,
        gamesPlayed: data.gamesPlayed || 0,
        gamesWon: data.gamesWon || 0,
        totalScore: data.totalScore || 0,
        bestScore: data.bestScore || 0,
        totalMatches: data.totalMatches || 0,
        perfectMatches: data.perfectMatches || 0,
        maxCombo: data.maxCombo || 0,
      },
    });
    return this.toDomain(stats);
  }

  async update(id: string, data: Partial<PlayerStats | IPlayerStats>): Promise<PlayerStats> {
    this.log(`Actualizando estadísticas: ${id}`);
    const stats = await this.prisma.playerStats.update({
      where: { id },
      data: {
        ...(data.gamesPlayed !== undefined && { gamesPlayed: data.gamesPlayed }),
        ...(data.gamesWon !== undefined && { gamesWon: data.gamesWon }),
        ...(data.totalScore !== undefined && { totalScore: data.totalScore }),
        ...(data.bestScore !== undefined && { bestScore: data.bestScore }),
        ...(data.totalMatches !== undefined && { totalMatches: data.totalMatches }),
        ...(data.perfectMatches !== undefined && { perfectMatches: data.perfectMatches }),
        ...(data.maxCombo !== undefined && { maxCombo: data.maxCombo }),
        updatedAt: new Date(),
      },
    });
    return this.toDomain(stats);
  }

  async delete(id: string): Promise<void> {
    this.log(`Eliminando estadísticas: ${id}`);
    await this.prisma.playerStats.delete({
      where: { id },
    });
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    orderBy?: 'gamesPlayed' | 'gamesWon' | 'bestScore' | 'totalScore';
  }): Promise<PlayerStats[]> {
    this.log('Listando estadísticas');
    const statsList = await this.prisma.playerStats.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy ? { [options.orderBy]: 'desc' } : undefined,
    });
    return statsList.map(stats => this.toDomain(stats));
  }

  async getTopPlayers(
    criteria: 'bestScore' | 'gamesWon' | 'totalScore',
    limit: number = 10
  ): Promise<PlayerStats[]> {
    this.log(`Obteniendo top ${limit} jugadores por ${criteria}`);
    const statsList = await this.prisma.playerStats.findMany({
      orderBy: { [criteria]: 'desc' },
      take: limit,
    });
    return statsList.map(stats => this.toDomain(stats));
  }

  async upsert(userId: string, data: Partial<IPlayerStats>): Promise<PlayerStats> {
    this.log(`Upsert estadísticas para usuario: ${userId}`);
    const stats = await this.prisma.playerStats.upsert({
      where: { userId },
      update: {
        ...(data.gamesPlayed !== undefined && { gamesPlayed: data.gamesPlayed }),
        ...(data.gamesWon !== undefined && { gamesWon: data.gamesWon }),
        ...(data.totalScore !== undefined && { totalScore: data.totalScore }),
        ...(data.bestScore !== undefined && { bestScore: data.bestScore }),
        ...(data.totalMatches !== undefined && { totalMatches: data.totalMatches }),
        ...(data.perfectMatches !== undefined && { perfectMatches: data.perfectMatches }),
        ...(data.maxCombo !== undefined && { maxCombo: data.maxCombo }),
        updatedAt: new Date(),
      },
      create: {
        userId,
        gamesPlayed: data.gamesPlayed || 0,
        gamesWon: data.gamesWon || 0,
        totalScore: data.totalScore || 0,
        bestScore: data.bestScore || 0,
        totalMatches: data.totalMatches || 0,
        perfectMatches: data.perfectMatches || 0,
        maxCombo: data.maxCombo || 0,
      },
    });
    return this.toDomain(stats);
  }
}
