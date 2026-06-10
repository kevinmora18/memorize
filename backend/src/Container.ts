import { PrismaClient } from '@prisma/client';
import { UserRepository } from './repositories/UserRepository';
import { PlayerStatsRepository } from './repositories/PlayerStatsRepository';
import { AuthService } from './services/AuthService';
import { UserService } from './services/UserService';
import { AuthController } from './controllers/AuthController';
import { RoomController } from './controllers/RoomController';
import { UserController } from './controllers/UserController';
import { RoomManager } from './managers/RoomManager';

/**
 * Container - Contenedor de Inyección de Dependencias
 * 
 * EXPLICACIÓN POO:
 * - DEPENDENCY INJECTION: Centraliza la creación de todas las dependencias
 * - SINGLETON: Usa el patrón singleton para servicios compartidos
 * - INVERSION OF CONTROL: Las clases no crean sus dependencias, las reciben
 * 
 * VENTAJAS:
 * - Facilita testing (podemos inyectar mocks)
 * - Desacopla componentes
 * - Facilita cambios (cambiar implementaciones sin tocar código)
 * - Centraliza configuración
 */
export class Container {
  private static instance: Container;

  // Clientes y managers compartidos
  public prisma: PrismaClient;
  public roomManager: RoomManager;

  // Repositorios
  public userRepository: UserRepository;
  public statsRepository: PlayerStatsRepository;

  // Servicios
  public authService: AuthService;
  public userService: UserService;

  // Controladores
  public authController: AuthController;
  public roomController: RoomController;
  public userController: UserController;

  /**
   * Constructor privado (Singleton)
   */
  private constructor() {
    console.log('📦 Inicializando Container...\n');

    // ============================================
    // 1. CLIENTES Y MANAGERS
    // ============================================
    console.log('  🔌 Creando clientes...');
    this.prisma = new PrismaClient();
    this.roomManager = RoomManager.getInstance();

    // ============================================
    // 2. REPOSITORIOS (necesitan prisma)
    // ============================================
    console.log('  🗄️  Creando repositorios...');
    this.userRepository = new UserRepository(this.prisma);
    this.statsRepository = new PlayerStatsRepository(this.prisma);

    // ============================================
    // 3. SERVICIOS (necesitan repositorios)
    // ============================================
    console.log('  ⚙️  Creando servicios...');
    this.authService = new AuthService(this.userRepository);
    this.userService = new UserService(this.userRepository, this.statsRepository);

    // ============================================
    // 4. CONTROLADORES (necesitan servicios)
    // ============================================
    console.log('  🎮 Creando controladores...');
    this.authController = new AuthController(this.authService);
    this.roomController = new RoomController(this.roomManager, this.userRepository);
    this.userController = new UserController(this.userService);

    console.log('\n✅ Container inicializado con todas las dependencias\n');
  }

  /**
   * Obtener instancia única (Singleton)
   */
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Inicializar servicios asíncronos
   */
  async initialize(): Promise<void> {
    console.log('🚀 Inicializando servicios asíncronos...');
    await this.authService.initialize();
    await this.userService.initialize();
    console.log('✅ Todos los servicios inicializados\n');
  }

  /**
   * Cerrar conexiones (para shutdown graceful)
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Cerrando conexiones...');
    await this.prisma.$disconnect();
    console.log('✅ Conexiones cerradas');
  }
}
