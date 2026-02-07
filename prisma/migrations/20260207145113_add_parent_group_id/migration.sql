-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "parent_group_id" INTEGER;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_parent_group_id_fkey" FOREIGN KEY ("parent_group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
