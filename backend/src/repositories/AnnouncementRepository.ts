import { PrismaClient, Announcement } from '@prisma/client';
import { BaseRepository } from '../core/BaseRepository';
import { IAnnouncementRepository } from '../core/interfaces/IRepository';

/**
 * AnnouncementRepository - Repositorio para gestión de anuncios del sistema
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseRepository<Announcement, string>
 * - SRP: Encapsula exclusivamente la persistencia de anuncios
 * - ISP: Implementa IAnnouncementRepository
 */
export class AnnouncementRepository
  extends BaseRepository<Announcement, string>
  implements IAnnouncementRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, 'Announcement');
  }

  async findById(id: string): Promise<Announcement | null> {
    return this.prisma.announcement.findUnique({ where: { id } });
  }

  async create(data: Partial<Announcement>): Promise<Announcement> {
    return this.prisma.announcement.create({
      data: {
        title: data.title!,
        message: data.message!,
        type: data.type || 'info',
        expiresAt: data.expiresAt || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async update(id: string, data: Partial<Announcement>): Promise<Announcement> {
    return this.prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        isActive: data.isActive,
        expiresAt: data.expiresAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.announcement.delete({ where: { id } });
  }

  async findAll(options?: { isActive?: boolean }): Promise<Announcement[]> {
    const where: any = {};
    if (options?.isActive !== undefined) where.isActive = options.isActive;
    return this.prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleActive(id: string, isActive: boolean): Promise<Announcement> {
    return this.prisma.announcement.update({
      where: { id },
      data: { isActive },
    });
  }
}
