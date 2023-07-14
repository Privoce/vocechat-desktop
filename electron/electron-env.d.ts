/// <reference types="vite-electron-plugin/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production";
    VSCODE_DEBUG?: "true";
    DIST_ELECTRON: string;
    DIST: string;
    /** /dist/ or /public/ */
    PUBLIC: string;
  }
}
