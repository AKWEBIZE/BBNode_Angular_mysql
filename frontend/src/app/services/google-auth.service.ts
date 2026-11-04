import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

declare global {
  interface Window {
    google?: any;
  }
}

/**
 * Thin wrapper around Google Identity Services (the "Sign in with Google"
 * button + ID-token flow). Deliberately not an npm package — GIS is a
 * single small script and this avoids pulling in a whole social-login
 * library for one provider. The ID token this produces is exactly what
 * the backend's POST /auth/google-login already expects.
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private scriptPromise: Promise<void> | null = null;

  private loadScript(): Promise<void> {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }
    if (this.scriptPromise) {
      return this.scriptPromise;
    }
    this.scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
    return this.scriptPromise;
  }

  /**
   * Renders the Google button into the element with the given id and wires
   * `onCredential` to fire with the raw ID token once the user completes
   * sign-in. Safe to call multiple times (e.g. buyer/seller tab switch) —
   * initialize() is idempotent and renderButton() just redraws.
   */
  async renderButton(elementId: string, onCredential: (idToken: string) => void): Promise<void> {
    try {
      await this.loadScript();
    } catch (err) {
      console.error('Google Sign-In unavailable:', err);
      return;
    }

    const el = document.getElementById(elementId);
    if (!el || !window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => onCredential(response.credential)
    });

    el.innerHTML = '';
    window.google.accounts.id.renderButton(el, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'signin_with'
    });
  }
}
