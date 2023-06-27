// import toast from "react-hot-toast";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";

const baseQuery = (url: string) =>
  fetchBaseQuery({
    baseUrl: url,
    prepareHeaders: (headers) => {
      return headers;
    }
  });

export default baseQuery;
