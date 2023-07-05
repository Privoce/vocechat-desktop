import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "./base.query";

type Server = {
  name: string;
  description: string;
};
export const dataApi = createApi({
  reducerPath: "dataApi",
  baseQuery: baseQuery(""),
  endpoints: (builder) => ({
    getServerInfo: builder.query<Server, string>({
      query: (server) => ({ url: `${server}/api/admin/system/organization`, timeout: 3000 })
    }),
    getServerVersion: builder.query<string, string>({
      query: (server) => ({ url: `${server}/api/admin/system/version`, responseHandler: "text" })
    }),
    getWebClientVersion: builder.query<string, string>({
      query: (frontend_url) => ({ url: `${frontend_url}/VERSION`, responseHandler: "text" })
    })
  })
});

export const {
  useLazyGetServerInfoQuery,
  useLazyGetServerVersionQuery,
  useLazyGetWebClientVersionQuery
} = dataApi;
