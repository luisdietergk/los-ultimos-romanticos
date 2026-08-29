-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "heroVideoUrl" TEXT,
    "patternUrl" TEXT,
    "teamCrestUrl" TEXT,
    "taglineHtml" TEXT NOT NULL DEFAULT 'Por amor al juego,<br>por amor a lo nuestro.',
    "historiaP1" TEXT NOT NULL DEFAULT '',
    "historiaP2" TEXT NOT NULL DEFAULT '',
    "ligaNombre" TEXT NOT NULL DEFAULT 'LIGA ROMÁNTICA CDT',
    "seasonYear" INTEGER NOT NULL DEFAULT 2026,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Rival" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "crestUrl" TEXT
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jornada" INTEGER NOT NULL,
    "jornadaLabel" TEXT NOT NULL,
    "rivalId" TEXT NOT NULL,
    "crestOverrideUrl" TEXT,
    "heroCrestUrl" TEXT,
    "kickoffAt" DATETIME NOT NULL,
    "venue" TEXT NOT NULL DEFAULT 'CDT',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Match_rivalId_fkey" FOREIGN KEY ("rivalId") REFERENCES "Rival" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "minute" INTEGER NOT NULL,
    "team" TEXT NOT NULL,
    "playerId" TEXT,
    "scorerName" TEXT NOT NULL,
    "note" TEXT,
    "shotX" REAL,
    "shotY" REAL,
    "goalX" REAL,
    "goalY" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Goal_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Goal_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dorsal" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'México',
    "apodo" TEXT,
    "quote" TEXT,
    "description" TEXT,
    "pj" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "photoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "ShopProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sizesCsv" TEXT NOT NULL DEFAULT 'S,M,L,XL',
    "priceMxn" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "KitImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Rival_name_key" ON "Rival"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Match_jornada_key" ON "Match"("jornada");

-- CreateIndex
CREATE INDEX "Goal_matchId_idx" ON "Goal"("matchId");

-- CreateIndex
CREATE INDEX "Goal_playerId_idx" ON "Goal"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "KitImage_type_key" ON "KitImage"("type");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
