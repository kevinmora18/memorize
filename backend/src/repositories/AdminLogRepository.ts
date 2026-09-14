import { PrismaClient } from '@prisma/client';
import { IAdminLogRepository } from '../core/interfaces/IRepository';

/**
 * AdminLogRepository - Repositorio para logs de auditoría administrativa
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - ISP: Implementa IAdminLogRepository segregada (append-only y consulta de auditoría)
 * - SRP: Exclusivamente responsable del registro y lectura de auditoría administrativa
 * - DIP: Permite a los servicios registrar logs sin acoplarse a PrismaClient
 */
export class AdminLogRepository implements IAdminLogRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createLog(data: {
    adminId: string;
    action: string;
    targetId?: string;
    details?: string;
  }): Promise<any> {
    return this.prisma.adminLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        targetId: data.targetId,
        details: data.details,
      },
    });
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    action?: string;
    adminId?: string;
  }): Promise<{ logs: any[]; total: number; totalPages: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options?.action) where.action = options.action;
    if (options?.adminId) where.adminId = options.adminId;

    const [logs, total] = await Promise.all([
      this.prisma.adminLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { id: true, username: true, email: true } },
        },
      }),
      this.prisma.adminLog.count({ where }),
    ]);

    return { logs, total, totalPages: Math.ceil(total / limit) };
  }
}
