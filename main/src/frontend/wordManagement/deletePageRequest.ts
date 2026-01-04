// deletePageRequest.ts
// A helper for sending DELETE requests for a page

export type DeletePageRequestData = {
  id: number;
}

export interface DeleteRequestResponse {
  success: boolean;
  data?: object;
  error?: string;
}

export const sendDeletePageRequest = (deletePageRequestData: DeletePageRequestData): Promise<DeleteRequestResponse> => {
  console.log('Deleting page with id:', deletePageRequestData.id);

  return new Promise((resolve) => {
    fetch('/api/deletePage', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deletePageRequestData),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((errText) => {
            throw new Error(`${res.status}: ${errText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        resolve({ success: true, data });
      })
      .catch((err) => {
        console.error('Failed to delete page:', err);
        resolve({ success: false, error: err.message });
      });
  });
}
