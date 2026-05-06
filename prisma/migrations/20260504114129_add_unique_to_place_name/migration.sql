/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `places` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[latitude,longitude]` on the table `places` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."activity_templates" ALTER COLUMN "when" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "places_name_key" ON "public"."places"("name");

-- CreateIndex
CREATE UNIQUE INDEX "places_latitude_longitude_key" ON "public"."places"("latitude", "longitude");
