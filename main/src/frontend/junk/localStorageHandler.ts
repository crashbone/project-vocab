export function addOrUpdate(localStoragePropertyId: string, newValue: string) {
  localStorage.setItem(localStoragePropertyId, newValue);
}

export function remove(localStoragePropertyId: string) {
  localStorage.removeItem(localStoragePropertyId);
}
