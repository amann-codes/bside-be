-- CreateTable
CREATE TABLE "SpotifyAccess" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "accessToken" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotifyAccess_pkey" PRIMARY KEY ("id")
);
