// https://www.reddit.com/r/electronjs/comments/10dh3lz/what_is_the_proper_way_to_permanently_store_data/
import fs from "fs";
import path from "path";
import { app } from "electron";

const USER_DATA_PATH = path.join(app.getPath("userData"), "server_list.json");

export function readUserData() {
  try {
    const data = fs.readFileSync(USER_DATA_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log("Error retrieving user data", error);
    // you may want to propagate the error, up to you

    return [
      {
        name: "Privoce",
        web_url:
          process.env.NODE_ENV === "development"
            ? "https://privoce.voce.chat"
            : "https://privoce.voce.chat",
        api_url: "https://dev.voce.chat"
      }
    ];
  }
}

export function writeUserData(data: object) {
  fs.writeFileSync(USER_DATA_PATH, JSON.stringify(data));
}
