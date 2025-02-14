-- CreateTable
CREATE TABLE "paymentmethods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "defaultLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "paymentmethods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paymentmethodlinks" (
    "id" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "paymentmethodlinks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "paymentmethodlinks" ADD CONSTRAINT "paymentmethodlinks_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "paymentmethods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "paymentmethodlinks" ADD CONSTRAINT "paymentmethodlinks_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
