-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('DISCORD', 'TWITTER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityProvider" (
    "id" UUID NOT NULL,
    "provider" "Provider" NOT NULL,

    CONSTRAINT "IdentityProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityToken" (
    "id" UUID NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "IdentityToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_IdentityProviderToUser" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_IdentityProviderToUser_AB_unique" ON "_IdentityProviderToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_IdentityProviderToUser_B_index" ON "_IdentityProviderToUser"("B");

-- AddForeignKey
ALTER TABLE "_IdentityProviderToUser" ADD CONSTRAINT "_IdentityProviderToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "IdentityProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IdentityProviderToUser" ADD CONSTRAINT "_IdentityProviderToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
