const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function checkAdmin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'kevin@test.com' }
    });

    if (user) {
      console.log('👤 Usuario encontrado:');
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      
      if (user.role === 'admin') {
        console.log('\n✅ ¡Eres ADMIN!');
        console.log('🎮 Ahora cierra sesión en el juego e inicia sesión de nuevo');
        console.log('🛡️  Verás el botón ADMIN en el menú');
      } else {
        console.log('\n⚠️  Aún eres:', user.role);
        console.log('💡 Cambia el rol en Prisma Studio: http://localhost:5555');
      }
    } else {
      console.log('❌ Usuario no encontrado');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
