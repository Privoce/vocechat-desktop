import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VocechatServer } from "@/types/common";

export interface StoredData {
  servers: VocechatServer[];
  active: string;
  addModalVisible: boolean;
  navViewTopmost: boolean;
}
const initialState: StoredData = {
  servers: [],
  active: "",
  addModalVisible: false,
  navViewTopmost: false
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    initializeServers(state, action: PayloadAction<VocechatServer[]>) {
      state.servers = action.payload;
      state.active = action.payload[0]?.web_url;
    },
    addServer(state, action: PayloadAction<VocechatServer>) {
      state.servers.push(action.payload);
      state.active = action.payload.web_url;
    },
    removeServer(state, action: PayloadAction<string>) {
      state.servers = state.servers.filter((server) => server.web_url != action.payload);
    },
    switchServer(state, action: PayloadAction<string>) {
      state.active = action.payload;
    },
    updateNavTopmost(state, action: PayloadAction<{ top: boolean; url?: string }>) {
      state.navViewTopmost = action.payload.top;
    },
    updateAddModalVisible(state, action: PayloadAction<boolean>) {
      state.addModalVisible = action.payload;
    }
  }
});

export const {
  initializeServers,
  addServer,
  removeServer,
  switchServer,
  updateAddModalVisible,
  updateNavTopmost
} = dataSlice.actions;
export default dataSlice.reducer;
