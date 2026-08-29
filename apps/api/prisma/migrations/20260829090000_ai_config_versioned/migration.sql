CREATE TABLE "AiAgent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiAgent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiPrompt" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiPrompt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiPromptVersion" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiPromptVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiDeployment" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "promptVersionId" TEXT,
    "modelConfigId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deployedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiDeployment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiModelConfig" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 2048,
    "responseMimeType" TEXT DEFAULT 'text/plain',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiModelConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiToolConfig" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "requireConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiToolConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiAgent_slug_key" ON "AiAgent"("slug");
CREATE INDEX "AiAgent_slug_idx" ON "AiAgent"("slug");
CREATE UNIQUE INDEX "AiPrompt_agentId_key_key" ON "AiPrompt"("agentId", "key");
CREATE INDEX "AiPrompt_agentId_idx" ON "AiPrompt"("agentId");
CREATE UNIQUE INDEX "AiPromptVersion_promptId_version_key" ON "AiPromptVersion"("promptId", "version");
CREATE INDEX "AiPromptVersion_promptId_status_idx" ON "AiPromptVersion"("promptId", "status");
CREATE INDEX "AiPromptVersion_status_idx" ON "AiPromptVersion"("status");
CREATE INDEX "AiDeployment_agentId_environment_isActive_idx" ON "AiDeployment"("agentId", "environment", "isActive");
CREATE INDEX "AiDeployment_environment_isActive_idx" ON "AiDeployment"("environment", "isActive");
CREATE INDEX "AiModelConfig_agentId_status_idx" ON "AiModelConfig"("agentId", "status");
CREATE UNIQUE INDEX "AiToolConfig_agentId_toolName_key" ON "AiToolConfig"("agentId", "toolName");
CREATE INDEX "AiToolConfig_agentId_enabled_idx" ON "AiToolConfig"("agentId", "enabled");

ALTER TABLE "AiPrompt" ADD CONSTRAINT "AiPrompt_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiPromptVersion" ADD CONSTRAINT "AiPromptVersion_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "AiPrompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiDeployment" ADD CONSTRAINT "AiDeployment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiDeployment" ADD CONSTRAINT "AiDeployment_promptVersionId_fkey" FOREIGN KEY ("promptVersionId") REFERENCES "AiPromptVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiDeployment" ADD CONSTRAINT "AiDeployment_modelConfigId_fkey" FOREIGN KEY ("modelConfigId") REFERENCES "AiModelConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiModelConfig" ADD CONSTRAINT "AiModelConfig_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiToolConfig" ADD CONSTRAINT "AiToolConfig_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
