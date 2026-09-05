// Script para hacer un usuario admin
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Uso: node set-admin.js <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });

    console.log('✅ Usuario actualizado a admin:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
