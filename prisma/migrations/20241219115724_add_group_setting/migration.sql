-- CreateTable
CREATE TABLE "groupsettings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "limitDate" TIMESTAMP(3) NOT NULL,
    "sponsorBonusPackageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "groupsettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groupsettingcommissionbonuses" (
    "id" TEXT NOT NULL,
    "groupSettingId" TEXT NOT NULL,
    "lPoint" INTEGER NOT NULL,
    "rPoint" INTEGER NOT NULL,
    "commission" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "groupsettingcommissionbonuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "groupsettings_limitDate_key" ON "groupsettings"("limitDate");

-- CreateIndex
CREATE UNIQUE INDEX "unique_index_on_group_setting_commission_bonus" ON "groupsettingcommissionbonuses"("groupSettingId", "lPoint", "rPoint");

-- AddForeignKey
ALTER TABLE "groupsettings" ADD CONSTRAINT "groupsettings_sponsorBonusPackageId_fkey" FOREIGN KEY ("sponsorBonusPackageId") REFERENCES "packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "groupsettingcommissionbonuses" ADD CONSTRAINT "groupsettingcommissionbonuses_groupSettingId_fkey" FOREIGN KEY ("groupSettingId") REFERENCES "groupsettings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
