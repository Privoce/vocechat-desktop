import { createListenerMiddleware } from "@reduxjs/toolkit";
import { ipcRenderer } from "electron";
import { RootState } from "../store";
import { VocechatServer } from "@/types/common";

const operations = ["__rtkq", "data"];

// Create the middleware instance and methods
const listenerMiddleware = createListenerMiddleware();

// Add one or more listener entries that look for specific actions.
// They may contain any sync or async logic, similar to thunks.
listenerMiddleware.startListening({
  predicate: (action) => {
    const { type = "" } = action;
    const [prefix] = type.split("/");
    console.log("predicate", action);
    // console.log("operation", type);
    return operations.includes(prefix);
    // console.log("listener predicate", action, currentState, previousState);
    // return true;
  },
  effect: async (action) => {
    const { type = "", payload } = action;
    // @ts-ignore
    const [prefix, operation]: [keyof RootState | "__rtkq", string] = type.split("/");
    // console.log("effect opt", action);
    // const currentState = listenerApi.getState() as RootState;
    // const state = prefix == "__rtkq" ? null : currentState[prefix];
    console.log("effect", prefix, payload);
    switch (prefix) {
      case "__rtkq":
        {
          // rtkqHandler({
          //   operation,
          //   payload,
          //   dispatch: listenerApi.dispatch
          // });
        }
        break;
      case "data":
        {
          switch (operation) {
            case "initializeServers":
              {
                const servers = (payload ?? []) as VocechatServer[];
                if (servers.length > 0) {
                  ipcRenderer.send("switch-server", { url: servers[0]?.web_url });
                  console.log("effect initializeServers");
                }
              }
              break;
            case "addServer":
              {
                ipcRenderer.send("add-server", { data: payload });
                console.log("effect add server");
              }
              break;
            case "removeServer":
              {
                ipcRenderer.send("remove-server", { url: payload });
                console.log("effect remove server");
              }
              break;

            default:
              break;
          }
        }
        break;

      default:
        break;
    }
  }
});

export default listenerMiddleware;
