import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import clsx from "clsx";
import {
  dataApi,
  useLazyGetServerInfoQuery,
  useLazyGetServerVersionQuery
} from "@/app/services/data";
import { addServer, switchServer, updateAddModalVisible } from "@/app/slices/data";
import { useAppSelector } from "@/app/store";
import { ReactComponent as IconClose } from "@/assets/icons/close.svg";
import { ReactComponent as InfoIcon } from "@/assets/icons/info.svg";
import { getServerUrl } from "@/utils";
import Button from "./base/button";
import Input from "./base/input";
import { useKey } from "rooks";

// type Props = {};
const initialInputs = {
  name: "",
  web_url: "",
  api_url: ""
};
const AddViewModal = () => {
  const containerRef = useRef(null);
  const servers = useAppSelector((store) => store.data.servers);
  const dispatch = useDispatch();
  const [err, setErr] = useState(false);
  const [getServerInfo, { data, isSuccess, isLoading, isError }] = useLazyGetServerInfoQuery();
  const [getServerVersion, { data: serverVersion, isSuccess: serverVersionSuccess }] =
    useLazyGetServerVersionQuery();
  const [inputs, setInputs] = useState(initialInputs);
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const {
      dataset: { type },
      value
    } = evt.target;
    if (!type) return;
    setInputs((prev) => ({
      ...prev,
      [type]: value
    }));
  };
  useEffect(() => {
    if (isError) {
      setErr(isError);
    }
  }, [isError]);

  useEffect(() => {
    console.log("version", serverVersion);

    if (data && isSuccess && serverVersionSuccess) {
      const serverInfo = {
        name: data.name,
        web_url: inputs.api_url,
        api_url: inputs.api_url,
        version: serverVersion
      };
      dispatch(addServer(serverInfo));
      handleCancel();
    }
  }, [isSuccess, data, serverVersion, serverVersionSuccess]);

  const handleAdd = async () => {
    console.log("add: current servers", servers);

    const { api_url } = inputs;
    const url = getServerUrl(api_url);
    if (!url) {
      setErr(true);
      return;
    }
    const _server = servers.find((s) => s.api_url == url);
    if (_server) {
      // 已存在，直接跳转
      handleCancel();
      dispatch(switchServer(_server.web_url));
      return;
    }
    setInputs((prev) => {
      return { ...prev, api_url: url };
    });
    await getServerInfo(url);
    await getServerVersion(url);
  };
  useKey(
    "Enter",
    () => {
      handleAdd();
    },
    {
      target: containerRef
    }
  );
  const handleCancel = () => {
    setInputs(initialInputs);
    setErr(false);
    dispatch(dataApi.util.resetApiState());
    dispatch(updateAddModalVisible(false));
  };
  const handleResetError = () => {
    setErr(false);
  };
  return (
    <div
      ref={containerRef}
      className="relative bg-white dark:bg-gray-900 w-screen h-screen p-10 pt-16 flex flex-col items-center justify-center"
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add a Server</h2>
      <div className="relative w-full flex flex-col gap-1 mt-8 mb-3">
        <label className="text-gray-900 dark:text-gray-100 text-sm" htmlFor="api_url">
          Server URL
        </label>
        <Input
          onFocus={handleResetError}
          disabled={isLoading}
          name="api_url"
          value={inputs.api_url}
          type="text"
          className={clsx("w-full", err && "error shadow-sm shadow-red-100 dark:shadow-red-900")}
          data-type="api_url"
          placeholder="Enter server URL"
          onChange={handleChange}
        />
        <span className={clsx("text-sm text-red-500", err ? "visible" : "invisible")}>
          No valid server found at this URL.
        </span>
        <InfoIcon className={clsx("absolute right-3 top-9", err ? "visible" : "invisible")} />
      </div>
      <Button onClick={handleAdd} disabled={isLoading}>
        {isLoading ? "Connecting" : `Connect`}
      </Button>
      <button className="absolute right-5 top-5" onClick={handleCancel} disabled={isLoading}>
        <IconClose />
      </button>
    </div>
  );
};

export default AddViewModal;
