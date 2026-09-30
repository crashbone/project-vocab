// logoutRequest.ts
// Backend deletes the access_token cookie (httponly, JS cannot remove it itself)

export interface LogoutRequestResponse {
  success: boolean;
  data?: object;
  error?: string;
}

export const sendLogoutRequest = (): Promise<LogoutRequestResponse> => {
  return new Promise((resolve) => {
    fetch('/api/logout', {
      method: 'POST',
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
        console.error('Failed to logout:', err);
        resolve({ success: false, error: err.message });
      });
  });
}
