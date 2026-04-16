/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdConfiguration {
  callback: (response: GoogleCredentialResponse) => void;
  client_id: string;
}

interface GoogleRenderedButtonOptions {
  size?: 'large' | 'medium' | 'small';
  shape?: 'circle' | 'pill' | 'rectangular' | 'square';
  text?:
    | 'continue_with'
    | 'signin_with'
    | 'signup_with'
    | 'signin'
    | 'signup';
  theme?: 'filled_black' | 'filled_blue' | 'outline';
  width?: number;
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize(config: GoogleIdConfiguration): void;
        renderButton(
          element: HTMLElement,
          options: GoogleRenderedButtonOptions,
        ): void;
      };
    };
  };
}
