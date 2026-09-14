import { PrismaClient, Promotion } from '@prisma/client';
import { BaseRepository } from '../core/BaseRepository';
import { IPromotionRepository } from '../core/interfaces/IRepository';

/**
 * PromotionRepository - Repositorio para gestión de promociones
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseRepository<Promotion, string>
 * - SRP: Encapsula exclusivamente la persistencia de promociones
 * - ISP: Implementa IPromotionRepository
 */
export class PromotionRepository
  extends BaseRepository<Promotion, string>
  implements IPromotionRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, 'Promotion');
  }

  async findById(id: string): Promise<Promotion | null> {
    return this.prisma.promotion.findUnique({ where: { id } });
  }

  async create(data: Partial<Promotion>): Promise<Promotion> {
    return this.prisma.promotion.create({
      data: {
        name: data.name!,
        description: data.description || '',
        type: data.type!,
        value: data.value!,
        startDate: data.startDate || new Date(),
        endDate: data.endDate!,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async update(id: string, data: Partial<Promotion>): Promise<Promotion> {
    return this.prisma.promotion.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.promotion.delete({ where: { id } });
  }

  async findAll(): Promise<Promotion[]> {
    return this.prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
