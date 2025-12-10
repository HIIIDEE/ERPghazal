
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const emp = await prisma.employee.findFirst({
        where: {
            OR: [
                { lastName: { contains: 'BENALI', mode: 'insensitive' } },
                { firstName: { contains: 'Karim', mode: 'insensitive' } }
            ]
        }
    });
    console.log('BENALI:', emp);
}

main();
