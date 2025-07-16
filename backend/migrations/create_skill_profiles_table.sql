-- Migration: Create skill_profiles table
-- Date: 2024-01-01

-- Create skill_profiles table
CREATE TABLE IF NOT EXISTS "SkillProfiles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "current_skills" JSONB NOT NULL DEFAULT '[]',
    "learning_goals" JSONB NOT NULL DEFAULT '[]',
    "interested_fields" JSONB NOT NULL DEFAULT '[]',
    "summary" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "last_updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT "SkillProfiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE,
    
    -- Unique constraint: one profile per user
    CONSTRAINT "SkillProfiles_user_id_unique" UNIQUE ("user_id")
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "idx_skill_profiles_user_id" ON "SkillProfiles"("user_id");
CREATE INDEX IF NOT EXISTS "idx_skill_profiles_is_public" ON "SkillProfiles"("is_public");
CREATE INDEX IF NOT EXISTS "idx_skill_profiles_last_updated" ON "SkillProfiles"("last_updated");

-- Add comment to table
COMMENT ON TABLE "SkillProfiles" IS 'Hồ sơ kỹ năng của sinh viên';

-- Add comments to columns
COMMENT ON COLUMN "SkillProfiles"."current_skills" IS 'Mảng các kỹ năng hiện có với chi tiết';
COMMENT ON COLUMN "SkillProfiles"."learning_goals" IS 'Mảng các mục tiêu học tập';
COMMENT ON COLUMN "SkillProfiles"."interested_fields" IS 'Mảng các lĩnh vực quan tâm';
COMMENT ON COLUMN "SkillProfiles"."summary" IS 'Tóm tắt về bản thân và định hướng';
COMMENT ON COLUMN "SkillProfiles"."is_public" IS 'Cho phép công ty xem hồ sơ';
COMMENT ON COLUMN "SkillProfiles"."last_updated" IS 'Thời gian cập nhật lần cuối'; 