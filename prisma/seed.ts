import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaNeon }   from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter });

async function main() {
  // Default settings
  await prisma.settings.upsert({
    where:  { key: 'general_profit' },
    update: {},
    create: { key: 'general_profit', value: '2' },
  });

  // Seed products only on a fresh database
  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({
      data: [
        { name: 'Jamón',          priceUsd: 8.50,  customProfit: null, unit: 'kg'    },
        { name: 'Queso Blanco',   priceUsd: 4.00,  customProfit: null, unit: 'kg'    },
        { name: 'Mortadela',      priceUsd: 5.50,  customProfit: 1.5,  unit: 'kg'    },
        { name: 'Queso Amarillo', priceUsd: 6.00,  customProfit: null, unit: 'kg'    },
        { name: 'Pernil',         priceUsd: 12.00, customProfit: 3.0,  unit: 'kg'    },
        { name: 'Agua Mineral',   priceUsd: 0.80,  customProfit: null, unit: 'litro' },
      ],
    });
    console.log('Seed: productos insertados');
  }

  console.log('Seed completado');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
