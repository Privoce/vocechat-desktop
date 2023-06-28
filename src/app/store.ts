import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  createStateSyncMiddleware,
  initStateWithPrevTab,
  withReduxStateSync
} from "redux-state-sync";
import listenerMiddleware from "./listener.middleware";
import { dataApi } from "./services/data";
import dataReducer from "./slices/data";

const config = {
  // filter out
  // predicate: (action: any) => {
  //   const { type } = action;
  //   const synced = !type.starsWith("dataApi");
  //   console.log("predicate sync", action.type, synced);
  //   return synced;
  // },
  // blacklist: ["dataApi/subscriptions/unsubscribeQueryResult"],
  whitelist: ["data/addServer"]
};
const middlewareList = createStateSyncMiddleware(config);
const reducer = combineReducers({
  data: dataReducer,
  [dataApi.reducerPath]: dataApi.reducer
});

const store = configureStore({
  reducer: withReduxStateSync(reducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(middlewareList, dataApi.middleware)
      .prepend(listenerMiddleware.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
initStateWithPrevTab(store);
export default store;
