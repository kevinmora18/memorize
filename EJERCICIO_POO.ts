/**
 * EJERCICIO DE POO - Sistema de Tienda
 * 
 * Implementa los 4 pilares:
 * 1. Encapsulación
 * 2. Abstracción
 * 3. Herencia
 * 4. Polimorfismo
 */

// ============================================
// 1. ABSTRACCIÓN - Clase base abstracta
// ============================================
abstract class Product {
  protected id: string;
  protected name: string;
  protected price: number;
  protected stock: number;

  constructor(id: string, name: string, price: number, stock: number) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
  }

  // Método abstracto - cada producto lo implementa diferente
  abstract calculateDiscount(): number;

  // Método concreto - todos lo usan igual
  canBuy(quantity: number): boolean {
    return this.stock >= quantity;
  }

  // 2. ENCAPSULACIÓN - Método público que usa privado
  public buy(quantity: number): number {
    if (!this.canBuy(quantity)) {
      throw new Error('Stock insuficiente');
    }
    
    const total = this.calculateTotal(quantity);
    this.updateStock(quantity); // ← privado
    return total;
  }

  // Método privado - solo la clase lo usa
  private updateStock(quantity: number): void {
    this.stock -= quantity;
  }

  private calculateTotal(quantity: number): number {
    const basePrice = this.price * quantity;
    const discount = this.calculateDiscount();
    return basePrice - (basePrice * discount);
  }
}

// ============================================
// 3. HERENCIA - Productos específicos
// ============================================

// Producto de Videojuego
class VideoGame extends Product {
  private platform: string;

  constructor(id: string, name: string, price: number, stock: number, platform: string) {
    super(id, name, price, stock); // ← llama al padre
    this.platform = platform;
  }

  // 4. POLIMORFISMO - Implementa descuento a su manera
  calculateDiscount(): number {
    // Videojuegos tienen 20% de descuento
    return 0.20;
  }

  // Método específico de VideoGame
  isPlayableOn(platform: string): boolean {
    return this.platform === platform;
  }
}

// Producto de Libro
class Book extends Product {
  private author: string;

  constructor(id: string, name: string, price: number, stock: number, author: string) {
    super(id, name, price, stock);
    this.author = author;
  }

  // 4. POLIMORFISMO - Libros sin descuento
  calculateDiscount(): number {
    return 0;
  }

  getAuthor(): string {
    return this.author;
  }
}

// Producto de Ropa
class Clothing extends Product {
  private size: string;

  constructor(id: string, name: string, price: number, stock: number, size: string) {
    super(id, name, price, stock);
    this.size = size;
  }

  // 4. POLIMORFISMO - Ropa 10% descuento
  calculateDiscount(): number {
    return 0.10;
  }

  getSize(): string {
    return this.size;
  }
}

// ============================================
// USO DEL SISTEMA
// ============================================

// Crear productos
const game = new VideoGame('1', 'Elden Ring', 60, 10, 'PS5');
const book = new Book('2', 'Clean Code', 40, 5, 'Robert Martin');
const shirt = new Clothing('3', 'Camiseta Negra', 20, 15, 'L');

// Array polimórfico - todos son Product
const products: Product[] = [game, book, shirt];

// Procesar compras (polimorfismo en acción)
console.log('=== SISTEMA DE TIENDA ===\n');

for (const product of products) {
  try {
    const total = product.buy(1);
    console.log(`✅ Compra exitosa - Total: $${total.toFixed(2)}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Output esperado:
// ✅ Compra exitosa - Total: $48.00 (60 - 20% = 48)
// ✅ Compra exitosa - Total: $40.00 (40 - 0% = 40)
// ✅ Compra exitosa - Total: $18.00 (20 - 10% = 18)

// ============================================
// EJERCICIO PARA TI:
// ============================================
// 1. Agrega un nuevo tipo de producto: "Electronics"
// 2. Los electrónicos tienen 15% de descuento
// 3. Agrega un método warranty(years: number) a Electronics
// 4. Crea 2 instancias y prueba comprarlas

