import { sequelize } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
    try {
        console.log('🔄 Bắt đầu chạy migration cho bảng SkillProfile...');

        // First, check if Users table exists
        console.log('🔍 Kiểm tra bảng Users...');
        const [userTableResults] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'Users'
        `);

        if (userTableResults.length === 0) {
            console.log('⚠️  Bảng Users chưa tồn tại. Đang khởi tạo database...');

            // Initialize database first
            const initSqlPath = path.join(__dirname, '..', 'init.sql');
            const initSql = fs.readFileSync(initSqlPath, 'utf8');

            console.log('📝 Thực thi init.sql...');
            await sequelize.query(initSql);
            console.log('✅ init.sql đã được thực thi thành công');

            // Import and sync models
            const { User, Task, Application, BlockchainRegistration, SkillProfile } = await import('../models/index.js');
            console.log('🔄 Đồng bộ các model...');
            await sequelize.sync({ alter: true });
            console.log('✅ Các model đã được đồng bộ thành công');
        } else {
            console.log('✅ Bảng Users đã tồn tại.');
        }

        // Now check if SkillProfile table already exists (Sequelize creates it as "SkillProfile")
        const [skillProfileResults] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'SkillProfile'
        `);

        if (skillProfileResults.length === 0) {
            console.log('📝 Tạo bảng SkillProfile...');

            // Read migration file
            const migrationPath = path.join(__dirname, '../migrations/create_skill_profiles_table.sql');
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

            // Execute migration
            await sequelize.query(migrationSQL);

            console.log('✅ Migration thành công! Bảng SkillProfile đã được tạo.');
        } else {
            console.log('✅ Bảng SkillProfile đã tồn tại.');
        }

        // Final verification
        const [finalResults] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'SkillProfile'
        `);

        if (finalResults.length > 0) {
            console.log('✅ Xác nhận: Bảng SkillProfile đã tồn tại trong database.');
        } else {
            console.log('⚠️  Cảnh báo: Không tìm thấy bảng SkillProfile trong database.');
        }

    } catch (error) {
        console.error('❌ Lỗi khi chạy migration:', error);
        if (error.parent) {
            console.error('Chi tiết lỗi:', error.parent.message);
        }
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('🔌 Đã đóng kết nối database.');
    }
};

// Run migration
runMigration(); 