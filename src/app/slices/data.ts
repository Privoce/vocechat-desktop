import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VocechatServer } from "@/types/common";
import { Servers } from "../config";

export interface StoredData {
  servers: VocechatServer[];
}
const initialState: StoredData = {
  servers: Servers
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    addServer(state, action: PayloadAction<VocechatServer>) {
      state.servers.push(action.payload);
    }
  }
});

export const { addServer } = dataSlice.actions;
export default dataSlice.reducer;
