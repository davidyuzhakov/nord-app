import type { SongStructureItem } from './song/dto/create-song.dto';

declare global {
  namespace PrismaJson {
    type SongStructure = SongStructureItem[];
  }
}
