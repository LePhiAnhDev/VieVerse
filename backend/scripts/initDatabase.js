import { sequelize } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDatabase = async () => {
    try {
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // Read and execute init.sql
        const initSqlPath = path.join(__dirname, '..', 'init.sql');
        const initSql = fs.readFileSync(initSqlPath, 'utf8');

        console.log('📝 Executing init.sql...');
        await sequelize.query(initSql);
        console.log('✅ init.sql executed successfully');

        // Sync all models
        console.log('🔄 Syncing models...');
        await sequelize.sync({ alter: true });
        console.log('✅ Models synced successfully');

        console.log('🎉 Database initialization completed!');

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        if (error.parent) {
            console.error('Details:', error.parent.message);
        }
    } finally {
        await sequelize.close();
    }
};

initDatabase(); 