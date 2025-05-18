// Custom window interface to allow adding ENV property
interface CustomWindow extends Window {
    ENV?: Record<string, string>;
    ENV_LOADED?: boolean;
    VERCEL_DOMAIN?: string;
    FIREBASE_CONFIG?: Record<string, any>;
}

declare let window: CustomWindow;
