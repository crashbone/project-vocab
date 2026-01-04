// addPageRequest.ts
// A helper for sending POST requests similar to the pattern used in GoogleLoginHelper

export type PostRequestDataType = {
  name: string;
  description: string
  words: string;
}

export interface PostRequestResponse {
  success: boolean;
  data?: object;
  error?: string;
}

export const sendAddNewPageRequest = (postRequestData: PostRequestDataType): Promise<PostRequestResponse> => {
  console.log(postRequestData);
  return new Promise((resolve) => {
    fetch('/api/addPage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postRequestData),
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
        console.error('Failed to add page:', err);
        resolve({ success: false, error: err.message });
      });
  });
}