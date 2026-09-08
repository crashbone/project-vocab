// updatePageRequest.ts
// Same shape as addNewPageRequest.ts, but PUT /api/updatePage and carries the page id.

export type UpdateRequestDataType = {
  id: number;
  name: string;
  description: string
  words: string;
}

export interface UpdateRequestResponse {
  success: boolean;
  data?: object;
  error?: string;
}

export const sendUpdatePageRequest = (updateRequestData: UpdateRequestDataType): Promise<UpdateRequestResponse> => {
  return new Promise((resolve) => {
    fetch('/api/updatePage', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateRequestData),
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
        console.error('Failed to update page:', err);
        resolve({ success: false, error: err.message });
      });
  });
}
