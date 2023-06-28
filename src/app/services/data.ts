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
      query: (server) => ({ url: `${server}/api/admin/system/organization` })
    })
  })
});

export const { useLazyGetServerInfoQuery } = dataApi;
