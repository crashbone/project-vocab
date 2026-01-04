export interface InitialData {
  logged_in: boolean
  user?: InitialDataUser
}

export interface InitialDataWithUser {
  logged_in: boolean
  user: InitialDataUser
}
export interface InitialDataUser {
  user_id: string
  name: string
  email: string
  avatar_url: string
}

export const fetchInitialData = (): Promise<InitialData> => {
  return fetch("/api/initialData", {
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
      throw err; // propagate error to caller
    });
};
