"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=find-benali.js.map