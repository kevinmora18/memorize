import { PrismaClient } from '@prisma/client';
import { UserRepository } from './repositories/UserRepository';
import { PlayerStatsRepository } from './repositories/PlayerStatsRepository';
import { MatchRepository } from './repositories/MatchRepository';
import { AnnouncementRepository } from './repositories/AnnouncementRepository';
import { PromotionRepository } from './repositories/PromotionRepository';
import { AdminLogRepository } from './repositories/AdminLogRepository';

import {
  IUserRepository,
  IPlayerStatsRepository,
  IMatchRepository,
  IAnnouncementRepository,
  IPromotionRepository,
  IAdminLogRepository,
} from './core/interfaces/IRepository';

import {
  IAuthService,
  IUserService,
  IMatchService,
  IAdminService,
  ILeaderboardService,
  IRoomManager,
} from './core/interfaces/IServices';

import { AuthService } from './services/AuthService';
import { UserService } from './services/UserService';
import { MatchService } from './services/MatchService';
import { AdminService } from './services/AdminService';
import { LeaderboardService } from './services/LeaderboardService';
import { AuthController } from './controllers/AuthController';
import { RoomController } from './controllers/RoomController';
import { UserController } from './controllers/UserController';
import { MatchController } from './controllers/MatchController';
import { AdminController } from './controllers/AdminController';
import { LeaderboardController } from './controllers/LeaderboardController';
import { RoomManager } from './managers/RoomManager';

/**
 * Container - Contenedor de Inversión de Control (IoC) y Dependency Injection (DI)
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - DIP (Dependency Inversion Principle): Todas las dependencias son expuestas e inyectadas
 *   mediante abstracciones (interfaces), desacoplando las clases de implementaciones concretas
 * - SINGLETON: Garantiza una única instancia del contenedor para toda la aplicación
 * - OCP: Nuevos servicios y repositorios se registran aquí sin alterar la estructura del cliente
 * - SRP: Exclusivamente responsable del ensamblaje y ciclo de vida de los componentes del backend
 */
export class Container {
  private static instance: Container;

  // Clientes y managers
  public prisma: PrismaClient;
  public roomManager: IRoomManager;

  // Repositorios tipados por Interfaces (DIP)
  public userRepository: IUserRepository;
  public statsRepository: IPlayerStatsRepository;
  public matchRepository: IMatchRepository;
  public announcementRepository: IAnnouncementRepository;
  public promotionRepository: IPromotionRepository;
  public adminLogRepository: IAdminLogRepository;

  // Servicios tipados por Interfaces (DIP)
  public authService: IAuthService;
  public userService: IUserService;
  public matchService: IMatchService;
  public adminService: IAdminService;
  public leaderboardService: ILeaderboardService;

  // Controladores
  public authController: AuthController;
  public roomController: RoomController;
  public userController: UserController;
  public matchController: MatchController;
  public adminController: AdminController;
  public leaderboardController: LeaderboardController;

  private constructor() {
    console.log('📦 Inicializando Container con Arquitectura POO & SOLID...\n');

    // ============================================
    // 1. INFRAESTRUCTURA Y MANAGERS
    // ============================================
    console.log('  🔌 Creando clientes de infraestructura...');
    this.prisma = new PrismaClient();
    this.roomManager = RoomManager.getInstance();

    // ============================================
    // 2. REPOSITORIOS (Persistencia desacoplada)
    // ============================================
    console.log('  🗄️  Creando repositorios...');
    this.userRepository = new UserRepository(this.prisma);
    this.statsRepository = new PlayerStatsRepository(this.prisma);
    this.matchRepository = new MatchRepository(this.prisma);
    this.announcementRepository = new AnnouncementRepository(this.prisma);
    this.promotionRepository = new PromotionRepository(this.prisma);
    this.adminLogRepository = new AdminLogRepository(this.prisma);

    // ============================================
    // 3. SERVICIOS (Lógica de Negocio desacoplada)
    // ============================================
    console.log('  ⚙️  Creando servicios con inyección de interfaces...');
    this.authService = new AuthService(this.userRepository);
    this.userService = new UserService(this.userRepository, this.statsRepository);
    this.matchService = new MatchService(
      this.matchRepository,
      this.userRepository,
      this.statsRepository
    );
    this.adminService = new AdminService(
      this.userRepository,
      this.matchRepository,
      this.announcementRepository,
      this.promotionRepository,
      this.adminLogRepository,
      this.prisma
    );
    this.leaderboardService = new LeaderboardService(
      this.userRepository,
      this.statsRepository,
      this.matchRepository,
      this.prisma
    );

    // ============================================
    // 4. CONTROLADORES (Transporte HTTP)
    // ============================================
    console.log('  🎮 Creando controladores...');
    this.authController = new AuthController(this.authService);
    this.roomController = new RoomController(this.roomManager, this.userRepository);
    this.userController = new UserController(this.userService);
    this.matchController = new MatchController(this.matchService);
    this.adminController = new AdminController(this.adminService);
    this.leaderboardController = new LeaderboardController(this.leaderboardService);

    console.log('\n✅ Container inicializado con 100% cumplimiento SOLID y POO\n');
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  async initialize(): Promise<void> {
    console.log('🚀 Inicializando servicios asíncronos...');
    await this.authService.initialize();
    await this.userService.initialize();
    await this.matchService.initialize();
    await this.adminService.initialize();
    await this.leaderboardService.initialize();
    console.log('✅ Todos los servicios inicializados\n');
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Cerrando conexiones...');
    await this.prisma.$disconnect();
    console.log('✅ Conexiones cerradas');
  }
}
