/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Gsi } from '@/junk/google-login/GoogleLoginTypes';

export enum LoginType {
  OneTapLogin,
  RedirectLogin,
}
const CLIENT_ID = '528850916057-ttuelhckp364cb2mo7q3etid31qv7c41.apps.googleusercontent.com';
const CONST = {
  [LoginType.OneTapLogin]: {},
  [LoginType.RedirectLogin]: {
    REDIRECT_URI: document.location.origin, // contains the code
    POST_REQUEST_URI: '/api/postGoogleLogin',
  }
}


// TODO, chatgpt gave me 'await' functions, replace them with promises and use .then. Code should not get blocked with 'await's
export class GoogleLoginHelper {
  private static _instance: GoogleLoginHelper | null = null;
  private gsiLoaded = false;

  private oneTapLogin = new OneTapLogin();
  private redirectLogin = new RedirectLogin();

  private constructor() { }

  static get instance(): GoogleLoginHelper {
    if (!this._instance) {
      this._instance = new GoogleLoginHelper();
    }
    return this._instance;
  }

  private async loadGsi(): Promise<Gsi> {
    if (this.gsiLoaded) return google;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.gsiLoaded = true;
        resolve(google);
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  private async initializeGoogleLogin(): Promise<Gsi> {
    return await this.loadGsi();
  }

  async signIn(loginType: LoginType, callback?: (response: any) => void): Promise<void> {
    const gsi = await this.initializeGoogleLogin();

    switch (loginType) {
      case LoginType.OneTapLogin:
        await this.oneTapLogin.signIn(gsi, callback);
        break;

      case LoginType.RedirectLogin:
        await this.redirectLogin.signIn(gsi, callback);
        break;

      default:
        throw new Error('Unknown login type');
    }
  }
}

// ------------------ Sub login method classes ------------------

class OneTapLogin {
  private initialized = false;

  public async signIn(gsi: Gsi, callback?: (response: any) => void): Promise<void> {
    if (!this.initialized) {
      // Sets the callback which will be called by google, after prompt() call
      await this.initialize(gsi, callback);
    }
    gsi.accounts.id.prompt();
  }

  private async initialize(gsi: Gsi, callback?: (response: any) => void): Promise<void> {
    if (this.initialized) return;

    console.log(`initialized with callback: ${callback}`);
    callback = callback || (() => { });

    gsi.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback,
      auto_select: false,
    });

    this.initialized = true;
  }
}

class RedirectLogin {
  private loginConfirmationRequestConfig: any = null;

  public signIn(gsi: Gsi, callback?: (response: any) => void): void {
    this.initClient(gsi, (response: any) => {
      this.registerRedirectLogin(response)
        .then((backendResponse) => {
          callback?.(backendResponse);
        })
        .catch((err) => {
          console.error("Failed to register RedirectLogin:", err);
          callback?.({ error: err.message });
        });
    }).then(client => {
      console.log("Redirect URI (frontend sent to Google):", CONST[LoginType.RedirectLogin].REDIRECT_URI);
      client.requestCode();
    }).catch(err => {
      console.error("Failed to initialize Google code client:", err);
    });
  }


  private async initClient(gsi: Gsi, callback?: (response: any) => void): Promise<any> {
    if (this.loginConfirmationRequestConfig) return this.loginConfirmationRequestConfig;

    // callback = callback || (() => {});

    console.log(`initialized with callback: ${callback}`);

    this.loginConfirmationRequestConfig = gsi.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: 'openid email profile',
      redirect_uri: CONST[LoginType.RedirectLogin].REDIRECT_URI,
      callback
    });

    return this.loginConfirmationRequestConfig;
  }

  private async registerRedirectLogin(response: { code: string }) {
    console.log(`Post request to ${CONST[LoginType.RedirectLogin].POST_REQUEST_URI} with code: ${response.code}`);
    try {
      if (!response.code) throw new Error("No authorization code provided");

      const res = await fetch(CONST[LoginType.RedirectLogin].POST_REQUEST_URI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: response.code })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server responded with ${res.status}: ${errText}`);
      }

      const result = await res.json();
      console.log("User registered on backend:", result);
      return result;

    } catch (err) {
      console.error("Failed to register RedirectLogin:", err);
      throw err;
    }
  }
}
