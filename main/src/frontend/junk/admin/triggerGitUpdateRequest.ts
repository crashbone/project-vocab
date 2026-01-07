// triggerGitUpdateRequest.ts
// A helper for triggering the Git update script via the Admin API

export interface GitUpdateResponse {
  success: boolean;
  message?: string;
  output?: string;
  error?: string;
}

export const sendTriggerGitUpdateRequest = (): Promise<GitUpdateResponse> => {
  console.log('Triggering admin Git update...');

  return new Promise((resolve) => {
    fetch('/api/admin/triggerGitUpdate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // No body required as the backend relies on the access_token cookie
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((errText) => {
            // Handle 403 (Not an Admin) or 500 (Script failed)
            throw new Error(`${res.status}: ${errText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        // Based on the Python backend returning { status: "success", ... }
        if (data.status === 'success') {
          resolve({ 
            success: true, 
            message: data.message, 
            output: data.output 
          });
        } else {
          resolve({ 
            success: false, 
            error: data.error || 'Unknown error occurred during script execution',
            output: data.output 
          });
        }
      })
      .catch((err) => {
        console.error('Failed to trigger Git update:', err);
        resolve({ success: false, error: err.message });
      });
  });
};