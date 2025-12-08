import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = 'admin@ghazal.com';
    const password = await bcrypt.hash('admin123', 10);

    console.log(`Seeding admin user: ${email}`);

    // Create Departments
    const deptIT = await prisma.department.create({
        data: { name: 'Information Technology' }
    });
    const deptHR = await prisma.department.create({
        data: { name: 'Human Resources' }
    });

    // Create Positions
    const posDev = await prisma.position.create({ data: { title: 'Senior Developer' } });
    const posHR = await prisma.position.create({ data: { title: 'HR Manager' } });

    // Admin Employee
    await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password,
            roles: [Role.ADMIN],
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
                    // Private
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

    // Example Employee: Sarah Connor
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
            // Private
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
