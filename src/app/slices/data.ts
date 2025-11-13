import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VocechatServer } from "@/types/common";

export interface StoredData {
  servers: VocechatServer[];
  active: string;
  addModalVisible: boolean;
  newMsgMap: Record<string, number>;
}
const initialState: StoredData = {
  servers: [],
  active: "",
  addModalVisible: false,
  newMsgMap: {}
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    initializeServers(state, action: PayloadAction<VocechatServer[]>) {
      console.log("action init servers", action.payload);

      state.servers = action.payload;
      state.active = action.payload[0]?.web_url;
    },
    addServer(state, action: PayloadAction<VocechatServer>) {
      state.servers.push(action.payload);
      state.active = action.payload.web_url;
    },
    removeServer(state, action: PayloadAction<string>) {
      const _web_url = action.payload;
      if (state.servers.some((server) => server.web_url == _web_url)) {
        const filteredServers = state.servers.filter((server) => server.web_url != action.payload);
        console.log("remove server", action.payload, filteredServers);
        if (filteredServers.length > 0) {
          state.active = filteredServers[0].web_url;
        } else {
          state.active = "";
        }
        state.servers = filteredServers;
      }
    },
    switchServer(state, action: PayloadAction<string>) {
      state.active = action.payload;
    },
    updateAddModalVisible(state, action: PayloadAction<boolean>) {
      state.addModalVisible = action.payload;
    },
    updateNewMsgMap(state, action: PayloadAction<{ server: string; hasNewMsg: boolean }>) {
      const { server, hasNewMsg } = action.payload;
      if (hasNewMsg) {
        const currentCount = state.newMsgMap[server] ?? 0;
        state.newMsgMap[server] = currentCount + 1;
      } else {
        state.newMsgMap[server] = 0;
      }
    }
  }
});

export const {
  initializeServers,
  updateNewMsgMap,
  addServer,
  removeServer,
  switchServer,
  updateAddModalVisible
} = dataSlice.actions;
export default dataSlice.reducer;
