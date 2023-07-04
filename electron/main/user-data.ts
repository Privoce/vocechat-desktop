// https://www.reddit.com/r/electronjs/comments/10dh3lz/what_is_the_proper_way_to_permanently_store_data/
import fs from "fs";
import path from "path";
import { app } from "electron";

const USER_DATA_PATH = path.join(app.getPath("userData"), "user_data.json");

export function readUserData() {
  try {
    const data = fs.readFileSync(USER_DATA_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log("Error retrieving user data", error);
    // you may want to propagate the error, up to you
    return null;
  }
}

export function writeUserData(data: object) {
  fs.writeFileSync(USER_DATA_PATH, JSON.stringify(data));
}
