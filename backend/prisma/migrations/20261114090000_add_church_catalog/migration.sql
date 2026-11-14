BEGIN;

-- Prevent concurrent writes while the song references and ownership change.
LOCK TABLE "Song", "Program", "ProgramSong" IN ACCESS EXCLUSIVE MODE;

CREATE TABLE "ChurchSong" (
    "id" SERIAL NOT NULL,
    "churchId" UUID NOT NULL,
    "sourceSongId" INTEGER,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "bpm" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "audio" TEXT,
    "danceVideo" TEXT,
    "structure" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchSong_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChurchSong_churchId_sourceSongId_key" ON "ChurchSong"("churchId", "sourceSongId");
CREATE INDEX "ChurchSong_sourceSongId_idx" ON "ChurchSong"("sourceSongId");

ALTER TABLE "ChurchSong" ADD CONSTRAINT "ChurchSong_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChurchSong" ADD CONSTRAINT "ChurchSong_sourceSongId_fkey" FOREIGN KEY ("sourceSongId") REFERENCES "Song"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Program" ADD COLUMN "churchId" UUID;

DO $$
DECLARE
    -- Set this to the existing target Church.id before deploying to production.
    target_church_id UUID := NULL;
BEGIN
    IF EXISTS (SELECT 1 FROM "Song") OR EXISTS (SELECT 1 FROM "Program") THEN
        IF target_church_id IS NULL THEN
            RAISE EXCEPTION 'Set target_church_id in this migration to transfer existing songs and programs';
        END IF;

        PERFORM 1 FROM "Church" WHERE "id" = target_church_id FOR KEY SHARE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Target church % does not exist', target_church_id;
        END IF;

        -- The new table is empty, so preserving song IDs also preserves all ProgramSong references.
        INSERT INTO "ChurchSong" (
            "id", "churchId", "sourceSongId", "name", "key", "bpm", "text",
            "audio", "danceVideo", "structure", "createdAt", "updatedAt"
        )
        SELECT
            "id", target_church_id, "id", "name", "key", "bpm", "text",
            "audio", "danceVideo", "structure", "createdAt", "updatedAt"
        FROM "Song";

        UPDATE "Program" SET "churchId" = target_church_id;

        PERFORM setval(
            pg_get_serial_sequence('"ChurchSong"', 'id'),
            COALESCE(MAX("id"), 1),
            MAX("id") IS NOT NULL
        ) FROM "ChurchSong";
    END IF;
END $$;

ALTER TABLE "Program" ALTER COLUMN "churchId" SET NOT NULL;
CREATE INDEX "Program_churchId_createdAt_idx" ON "Program"("churchId", "createdAt");
ALTER TABLE "Program" ADD CONSTRAINT "Program_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProgramSong" DROP CONSTRAINT "ProgramSong_songId_fkey";
ALTER TABLE "ProgramSong" ADD CONSTRAINT "ProgramSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "ChurchSong"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProgramSong" DROP CONSTRAINT "ProgramSong_programId_fkey";
ALTER TABLE "ProgramSong" ADD CONSTRAINT "ProgramSong_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
