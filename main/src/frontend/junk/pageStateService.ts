// Sayfa durumunu saklama. 'local' = kalıcı (draft), 'session' = sadece yenilemede geri gelir.
type StorageKind = 'local' | 'session';

export const PAGE_STATE_KEYS = {
  draft: 'pageState:draft',
  words: (pageId: number | string) => `pageState:words:${pageId}`,
  multipleChoice: (pageId: number | string) => `pageState:multipleChoice:${pageId}`,
};

function storage(kind: StorageKind): Storage {
  return kind === 'local' ? localStorage : sessionStorage;
}

export function savePageState(key: string, value: unknown, kind: StorageKind): void {
  try {
    storage(kind).setItem(key, JSON.stringify(value));
  } catch {
    // depolama dolu / engelli: sessizce geç
  }
}

export function loadPageState<T>(key: string, kind: StorageKind): T | null {
  try {
    const raw = storage(kind).getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export function clearPageState(key: string, kind: StorageKind): void {
  try {
    storage(kind).removeItem(key);
  } catch {
    // yoksay
  }
}
