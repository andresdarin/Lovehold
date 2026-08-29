DROP INDEX IF EXISTS "AiDeployment_agentId_environment_isActive_idx";
CREATE UNIQUE INDEX "AiDeployment_agentId_environment_active_unique" ON "AiDeployment"("agentId", "environment") WHERE "isActive" = true;
