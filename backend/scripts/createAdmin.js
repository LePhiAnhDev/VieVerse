import { User } from '../models/index.js';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // Check if admin already exists
        const existingAdmin = await User.findOne({
            where: { email: 'admin@vievverse.com' }
        });

        if (existingAdmin) {
            console.log('⚠️ Admin user already exists');
            return;
        }

        // Create admin user
        const adminData = {
            email: 'admin@vievverse.com',
            password: 'Admin@123',
            name: 'VieVerse Admin',
            role: 'admin',
            is_verified: true
        };

        const admin = await User.create(adminData);

        console.log('✅ Admin user created successfully');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password: Admin@123');
        console.log('⚠️ Please change the password after first login');

    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        await sequelize.close();
    }
};

createAdmin(); 