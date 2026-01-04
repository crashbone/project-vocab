export interface PageJSON {
  id: number;
  name: string;
  description: string;
  words: string;
  time_spent_seconds: number
  last_entry_at: string // ISO 8601
}

export const fetchPages = (): Promise<PageJSON[]> => {
  return fetch("/api/page", {
    method: "GET",
    credentials: "include"  // ⚠ must include credentials to send cookies cross-origin
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json(); // resolves to JSON
    })
    .catch(err => {
      console.error("Error fetching page:", err);
      throw err; // propagate error to caller
    });
};
