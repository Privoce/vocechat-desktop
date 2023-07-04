import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  Config,
  createStateSyncMiddleware,
  initMessageListener,
  withReduxStateSync
} from "redux-state-sync";
import listenerMiddleware from "./listener.middleware";
import { dataApi } from "./services/data";
import dataReducer from "./slices/data";

const config = {
  // Overwrite existing state with incoming state
  receiveState: (prevState, nextState) => {
    console.log("receiveState", prevState, nextState);

    return nextState;
  },
  broadcastChannelOption: {
    type: "native"
  },
  whitelist: ["data/addServer", "data/switchServer"]
} as Config;
const middlewareList = createStateSyncMiddleware(config);
const reducer = combineReducers({
  data: dataReducer,
  [dataApi.reducerPath]: dataApi.reducer
});

const store = configureStore({
  reducer: withReduxStateSync(reducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(dataApi.middleware, middlewareList)
      .prepend(listenerMiddleware.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
initMessageListener(store);
export default store;
