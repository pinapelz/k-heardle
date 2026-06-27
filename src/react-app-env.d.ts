/// <reference types="react-scripts" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_CDN_URL?: string;
    readonly VITE_HEARDLE_SALT?: string;
    readonly VITE_HEARDLE_API_URL?: string;
    readonly VITE_START_DATE?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
