import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import clsx from "clsx";
import { useLazyGetServerInfoQuery } from "@/app/services/data";
import { addServer, switchServer, updateAddModalVisible } from "@/app/slices/data";
import { useAppSelector } from "@/app/store";
import { ReactComponent as IconClose } from "@/assets/icons/close.svg";
import { getServerUrl } from "@/utils";
import Button from "./base/button";
import Input from "./base/input";

// type Props = {};
const initialInputs = {
  name: "",
  web_url: "",
  api_url: ""
};
const AddViewModal = () => {
  const servers = useAppSelector((store) => store.data.servers);
  const dispatch = useDispatch();
  const [err, setErr] = useState(false);
  const [getServerInfo, { data, isSuccess, isLoading, isError }] = useLazyGetServerInfoQuery();
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
    if (data && isSuccess) {
      const serverInfo = {
        name: data.name,
        web_url: inputs.api_url,
        api_url: inputs.api_url
      };
      dispatch(addServer(serverInfo));
      handleCancel();
    }
  }, [isSuccess, data]);

  const handleAdd = async () => {
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
  };
  const handleCancel = () => {
    setInputs(initialInputs);
    setErr(false);
    dispatch(updateAddModalVisible(false));
  };
  const handleResetError = () => {
    setErr(false);
  };
  return (
    <div className="relative bg-white dark:bg-gray-900 w-screen h-screen p-10 pt-16 flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add a Server</h2>
      <div className="w-full flex flex-col gap-1 mt-8 mb-3">
        <label className="text-gray-900 dark:text-gray-100 text-sm" htmlFor="api_url">
          Server URL
        </label>
        <Input
          onFocus={handleResetError}
          disabled={isLoading}
          name="api_url"
          value={inputs.api_url}
          type="text"
          className={clsx("w-full", err && "error")}
          data-type="api_url"
          placeholder="Enter server URL"
          onChange={handleChange}
        />
        <span className={clsx("text-sm text-red-500", err ? "visible" : "invisible")}>
          No valid server found at this URL.
        </span>
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
