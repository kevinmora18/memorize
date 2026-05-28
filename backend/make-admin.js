const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function makeAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('❌ Uso: node make-admin.js <email>');
    console.log('Ejemplo: node make-admin.js kevin@test.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ Usuario con email "${email}" no encontrado`);
      process.exit(1);
    }

    await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });

    console.log(`✅ Usuario "${email}" ahora es ADMINISTRADOR`);
    console.log('🎉 Inicia sesión de nuevo para ver el panel de admin');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
