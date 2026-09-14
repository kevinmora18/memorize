import bcrypt from 'bcryptjs';
import { BaseService } from '../core/BaseService';
import { IUserRepository } from '../core/interfaces/IRepository';
import { IAuthService } from '../core/interfaces/IServices';
import { User } from '../models/domain/User.model';
import { signToken } from '../core/JwtUtil';

/**
 * AuthService - Servicio de autenticación con JWT y contraseñas hasheadas
 *
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseService
 * - DIP: Depende de la abstracción IUserRepository, no de una clase concreta
 * - ISP: Implementa la interfaz específica IAuthService
 * - SRP: Solo maneja lógica de autenticación, registro y validación de acceso
 */
export class AuthService extends BaseService implements IAuthService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    super('AuthService');
    this.userRepository = userRepository;
  }

  async initialize(): Promise<void> {
    this.log('Servicio de autenticación inicializado');
  }

  async register(email: string, password: string, username?: string): Promise<User> {
    try {
      this.log(`Registrando usuario: ${email}`);

      if (!email || !email.includes('@') || email.includes(' ')) {
        throw new Error('Email inválido');
      }

      if (!password || password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const existing = await this.userRepository.findByEmail(email);
      if (existing) {
        throw new Error('Ya existe una cuenta con este email');
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await this.userRepository.create({
        email,
        username: username || email.split('@')[0],
        passwordHash,
      });
      this.log(`Usuario registrado: ${user.id}`);
      return user;
    } catch (error: any) {
      this.handleError(error, 'register');
    }
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      this.log(`Intentando login para: ${email}`);

      const user = await this.userRepository.findByEmail(email);
      if (!user || !user.hasPassword()) {
        throw new Error('Credenciales inválidas');
      }

      const valid = await bcrypt.compare(password, user.passwordHash || '');
      if (!valid) {
        throw new Error('Credenciales inválidas');
      }

      if (user.isCurrentlyBanned()) {
        const message = user.bannedUntil
          ? `Usuario baneado hasta ${user.bannedUntil}`
          : 'Usuario baneado permanentemente';
        throw new Error(message);
      }

      await this.userRepository.updateLastLogin(user.id);

      const token = signToken({
        userId: user.id,
        role: user.role,
        username: user.username,
      });

      return { user, token };
    } catch (error: any) {
      this.handleError(error, 'login');
    }
  }

  async validateAccess(userId: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) return false;
      return !user.isCurrentlyBanned();
    } catch (error: any) {
      this.log(`Error validando acceso: ${error.message}`, 'error');
      return false;
    }
  }

  async isAdmin(userId: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(userId);
      return user ? user.isAdmin() : false;
    } catch (error: any) {
      this.log(`Error verificando admin: ${error.message}`, 'error');
      return false;
    }
  }
}