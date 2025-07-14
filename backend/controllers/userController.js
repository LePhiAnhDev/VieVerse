import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { User, Task, Application } from '../models/index.js';

export const getDashboard = async (req, res) => {
    try {
        const user = req.user;
        let dashboardData = {};

        if (user.role === 'student') {
            // Get student dashboard data
            const totalApplications = await Application.count({
                where: { student_id: user.id }
            });

            const acceptedApplications = await Application.count({
                where: {
                    student_id: user.id,
                    status: 'accepted'
                }
            });

            const completedTasks = await Application.count({
                where: {
                    student_id: user.id,
                    work_status: 'completed'
                }
            });

            const recentApplications = await Application.findAll({
                where: { student_id: user.id },
                include: [
                    {
                        model: Task,
                        as: 'task',
                        include: [
                            {
                                model: User,
                                as: 'company',
                                attributes: ['id', 'name', 'company_name', 'avatar']
                            }
                        ]
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: 5
            });

            dashboardData = {
                stats: {
                    total_applications: totalApplications,
                    accepted_applications: acceptedApplications,
                    completed_tasks: completedTasks,
                    current_tokens: user.tokens
                },
                recent_applications: recentApplications
            };
        } else if (user.role === 'company') {
            // Get company dashboard data
            const totalTasks = await Task.count({
                where: { company_id: user.id }
            });

            const activeTasks = await Task.count({
                where: {
                    company_id: user.id,
                    status: 'in_progress'
                }
            });

            const completedTasks = await Task.count({
                where: {
                    company_id: user.id,
                    status: 'completed'
                }
            });

            const totalApplications = await Application.count({
                include: [
                    {
                        model: Task,
                        as: 'task',
                        where: { company_id: user.id }
                    }
                ]
            });

            const recentTasks = await Task.findAll({
                where: { company_id: user.id },
                include: [
                    {
                        model: Application,
                        as: 'applications',
                        include: [
                            {
                                model: User,
                                as: 'student',
                                attributes: ['id', 'name', 'avatar', 'university', 'major']
                            }
                        ]
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: 5
            });

            dashboardData = {
                stats: {
                    total_tasks: totalTasks,
                    active_tasks: activeTasks,
                    completed_tasks: completedTasks,
                    total_applications: totalApplications
                },
                recent_tasks: recentTasks
            };
        }

        res.json({
            user: user.getPublicProfile(),
            dashboard: dashboardData
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        let profileData = user.getPublicProfile();

        if (user.role === 'student') {
            // Get student's completed tasks and achievements
            const completedApplications = await Application.findAll({
                where: {
                    student_id: id,
                    work_status: 'completed'
                },
                include: [
                    {
                        model: Task,
                        as: 'task',
                        include: [
                            {
                                model: User,
                                as: 'company',
                                attributes: ['id', 'name', 'company_name', 'avatar']
                            }
                        ]
                    }
                ],
                order: [['completed_at', 'DESC']],
                limit: 10
            });

            const totalEarned = await Application.sum('task.reward_tokens', {
                where: {
                    student_id: id,
                    work_status: 'completed'
                },
                include: [
                    {
                        model: Task,
                        as: 'task',
                        attributes: []
                    }
                ]
            });

            profileData = {
                ...profileData,
                completed_tasks: completedApplications,
                total_tokens_earned: totalEarned || 0,
                success_rate: completedApplications.length > 0 ?
                    (completedApplications.length / await Application.count({
                        where: { student_id: id, status: 'accepted' }
                    })) * 100 : 0
            };
        } else if (user.role === 'company') {
            // Get company's tasks and stats
            const tasks = await Task.findAll({
                where: { company_id: id },
                include: [
                    {
                        model: Application,
                        as: 'applications',
                        where: { work_status: 'completed' },
                        required: false
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: 10
            });

            const totalTasksPosted = await Task.count({
                where: { company_id: id }
            });

            const completedTasks = await Task.count({
                where: {
                    company_id: id,
                    status: 'completed'
                }
            });

            profileData = {
                ...profileData,
                recent_tasks: tasks,
                total_tasks_posted: totalTasksPosted,
                total_completed_tasks: completedTasks,
                completion_rate: totalTasksPosted > 0 ?
                    (completedTasks / totalTasksPosted) * 100 : 0
            };
        }

        res.json({
            user: profileData
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const {
            q, // search query
            role,
            skills,
            university,
            industry,
            page = 1,
            limit = 10
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${q}%` } },
                { company_name: { [Op.iLike]: `%${q}%` } },
                { university: { [Op.iLike]: `%${q}%` } },
                { major: { [Op.iLike]: `%${q}%` } }
            ];
        }

        if (role) {
            where.role = role;
        }

        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim());
            where.skills = {
                [Op.overlap]: skillsArray
            };
        }

        if (university) {
            where.university = { [Op.iLike]: `%${university}%` };
        }

        if (industry) {
            where.industry = { [Op.iLike]: `%${industry}%` };
        }

        const users = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        const publicUsers = users.rows.map(user => user.getPublicProfile());

        res.json({
            users: publicUsers,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(users.count / limit),
                total_users: users.count,
                per_page: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};



export const getApplications = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const where = { student_id: req.user.id };
        if (status) {
            where.status = status;
        }

        const applications = await Application.findAndCountAll({
            where,
            include: [
                {
                    model: Task,
                    as: 'task',
                    include: [
                        {
                            model: User,
                            as: 'company',
                            attributes: ['id', 'name', 'company_name', 'avatar', 'is_verified']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            applications: applications.rows,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(applications.count / limit),
                total_applications: applications.count,
                per_page: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}; 