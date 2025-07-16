-- Migration: Add blockchain fields to Task table
-- Date: 2025-07-16

-- Add blockchain_task_id column
ALTER TABLE "Tasks" 
ADD COLUMN "blockchain_task_id" INTEGER;

-- Add blockchain_tx_hash column  
ALTER TABLE "Tasks" 
ADD COLUMN "blockchain_tx_hash" VARCHAR(255);

-- Add comments
COMMENT ON COLUMN "Tasks"."blockchain_task_id" IS 'Task ID from blockchain';
COMMENT ON COLUMN "Tasks"."blockchain_tx_hash" IS 'Transaction hash from blockchain'; 