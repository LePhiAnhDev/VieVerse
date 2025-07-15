-- VieVerse Database Initialization Script

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'company', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE work_status AS ENUM ('not_started', 'in_progress', 'submitted', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for blockchain registration status
DO $$ BEGIN
    CREATE TYPE blockchain_registration_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for blockchain registration role
DO $$ BEGIN
    CREATE TYPE blockchain_registration_role AS ENUM ('student', 'company');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tables will be created by Sequelize automatically
