/// <reference types="vite-plugin-svgr/client" />

import { ElectronAPI } from "@electron-toolkit/preload";

export type VocechatServer = {
  name: string;
  web_url: string;
  api_url?: string;
  version?: string;
};
export declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
