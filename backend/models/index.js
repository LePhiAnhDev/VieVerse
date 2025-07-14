import User from './User.js';
import Task from './Task.js';
import Application from './Application.js';

User.hasMany(Task, {
    foreignKey: 'company_id',
    as: 'createdTasks',
    onDelete: 'CASCADE'
});

Task.belongsTo(User, {
    foreignKey: 'company_id',
    as: 'company',
    onDelete: 'CASCADE'
});

User.hasMany(Application, {
    foreignKey: 'student_id',
    as: 'applications',
    onDelete: 'CASCADE'
});

Application.belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student',
    onDelete: 'CASCADE'
});

Task.hasMany(Application, {
    foreignKey: 'task_id',
    as: 'applications',
    onDelete: 'CASCADE'
});

Application.belongsTo(Task, {
    foreignKey: 'task_id',
    as: 'task',
    onDelete: 'CASCADE'
});

// Selected student association
Task.belongsTo(User, {
    foreignKey: 'selected_student_id',
    as: 'selectedStudent',
    onDelete: 'SET NULL'
});

User.hasMany(Task, {
    foreignKey: 'selected_student_id',
    as: 'assignedTasks',
    onDelete: 'SET NULL'
});

export { User, Task, Application }; 