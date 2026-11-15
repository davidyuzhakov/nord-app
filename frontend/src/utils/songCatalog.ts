import type { SongCatalog } from '@/models/Song';
import type { User } from '@/models/User';

export const libraryCacheMaxAge = 5 * 60 * 1000;

export function canManageCatalog(user: User | null) {
  return user?.email === 'davidyuzhakov17@gmail.com';
}

export function getSongCatalog(params: URLSearchParams): SongCatalog {
  return params.get('catalog') === 'general' && !params.has('programId')
    ? 'general'
    : 'church';
}
