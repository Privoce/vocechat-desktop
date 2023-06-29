import { VocechatServer } from "@/types/common";

export const LOCAL_DATA_KEY = "VC_DESKTOP_DATA";
export const Servers: VocechatServer[] = [
  {
    name: "Privoce",
    web_url:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3009"
        : "https://privoce.voce.chat",
    api_url: "https://dev.voce.chat"
  }
];

// ,
// {
//   name: "Tristan",
//   web_url: "https://vocechat.yangerxiao.com"
// }
