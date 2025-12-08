"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    const email = 'admin@ghazal.com';
    const password = await bcrypt.hash('admin123', 10);
    console.log(`Seeding admin user: ${email}`);
    const deptIT = await prisma.department.create({
        data: { name: 'Information Technology' }
    });
    const deptHR = await prisma.department.create({
        data: { name: 'Human Resources' }
    });
    const posDev = await prisma.position.create({ data: { title: 'Senior Developer' } });
    const posHR = await prisma.position.create({ data: { title: 'HR Manager' } });
    await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password,
            roles: [client_1.Role.ADMIN],
            employee: {
                create: {
                    firstName: 'Admin',
                    lastName: 'System',
                    workEmail: email,
                    jobTitle: 'System Administrator',
                    workPhone: '+33 1 23 45 67 89',
                    workMobile: '+33 6 12 34 56 78',
                    workingHours: 'Standard 40h',
                    timezone: 'Europe/Paris',
                    workAddress: '123 Tech Lane, Paris',
                    workLocation: 'Building A, Floor 3',
                    hireDate: new Date(),
                    employeeType: 'EMPLOYEE',
                    address: '12 Admin Street, Paris',
                    phone: '+33 1 99 88 77 66',
                    privateEmail: 'admin.private@gmail.com',
                    nationality: 'French',
                    maritalStatus: 'SINGLE',
                    gender: 'MALE',
                    birthday: new Date('1990-01-01'),
                    placeOfBirth: 'Paris',
                    countryOfBirth: 'France',
                    departmentId: deptIT.id,
                    contracts: {
                        create: {
                            type: 'CDI',
                            status: 'RUNNING',
                            startDate: new Date(),
                            wage: 5000
                        }
                    }
                }
            }
        },
    });
    await prisma.employee.create({
        data: {
            firstName: 'Sarah',
            lastName: 'Connor',
            workEmail: 'sarah.connor@ghazal.com',
            jobTitle: 'HR Manager',
            workPhone: '+33 1 55 55 55 55',
            workMobile: '+33 6 55 55 55 55',
            workingHours: 'Standard 40h',
            timezone: 'Europe/Paris',
            hireDate: new Date('2023-01-15'),
            departmentId: deptHR.id,
            positionId: posHR.id,
            address: '456 Skynet Blvd, Los Angeles',
            privateEmail: 'sarah.c@hotmail.com',
            nationality: 'American',
            maritalStatus: 'WIDOWER',
            gender: 'FEMALE',
            birthday: new Date('1985-05-12'),
            contracts: {
                create: {
                    type: 'CDI',
                    status: 'RUNNING',
                    startDate: new Date('2023-01-15'),
                    wage: 4200
                }
            }
        }
    });
    console.log('Seeding completed.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map