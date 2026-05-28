const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Conectar a la base de datos por defecto 'postgres'
  const client = new Client({
    user: 'postgres',
    password: '12345678',
    host: 'localhost',
    port: 5432,
    database: 'postgres' // Conectar a la BD por defecto
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Verificar si la base de datos ya existe
    const checkDb = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = 'memorize'
    `);

    if (checkDb.rows.length > 0) {
      console.log('✅ La base de datos "memorize" ya existe');
    } else {
      // Crear la base de datos
      await client.query('CREATE DATABASE memorize');
      console.log('✅ Base de datos "memorize" creada exitosamente!');
    }

    await client.end();
    console.log('\n🎉 Todo listo! Ahora puedes ejecutar:');
    console.log('   npm run prisma:push');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createDatabase();
