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
import ModalWrapper from "./base/modal-wrapper";
import Modal from "./base/modal";
import { PRIVOCE_SERVER_URL, PRIVOCE_WEB_URL } from "@/app/config";

// type Props = {};
const initialInputs = {
  name: "",
  web_url: "",
  api_url: ""
};
const AddServerModal = ({ mask = true }: { mask?: boolean }) => {
  const containerRef = useRef(null);
  const servers = useAppSelector((store) => store.data.servers);
  const dispatch = useDispatch();
  const [err, setErr] = useState(false);
  const [getServerInfo, { data, isSuccess, isLoading, isError }] = useLazyGetServerInfoQuery();
  const [getServerVersion, { data: serverVersion, isSuccess: serverVersionSuccess }] =
    useLazyGetServerVersionQuery();
  const [inputs, setInputs] = useState(initialInputs);
  const noServerAdded = servers.length == 0;
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
        web_url: inputs.api_url == PRIVOCE_SERVER_URL ? PRIVOCE_WEB_URL : PRIVOCE_SERVER_URL,
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
    let url = api_url;
    if (noServerAdded && !api_url) {
      // 走单独的特殊逻辑
      url = PRIVOCE_SERVER_URL;
      setInputs((prev) => {
        return { ...prev, api_url: PRIVOCE_SERVER_URL };
      });
    } else {
      // 通用逻辑
      url = getServerUrl(api_url);
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
    }
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
    <ModalWrapper mask={mask}>
      <Modal className="h-auto w-96">
        <div
          ref={containerRef}
          className="relative flex flex-col items-center justify-center bg-white py-4 dark:bg-gray-900"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add a Server</h2>
          <div className="relative mb-3 mt-8 flex w-full flex-col items-start gap-1">
            <label className="text-sm text-gray-900 dark:text-gray-100" htmlFor="api_url">
              Server URL
            </label>
            <Input
              onFocus={handleResetError}
              disabled={isLoading}
              name="api_url"
              value={inputs.api_url}
              type="text"
              className={clsx(
                "w-full",
                err && "error shadow-sm shadow-red-100 dark:shadow-red-900"
              )}
              data-type="api_url"
              placeholder={noServerAdded ? PRIVOCE_SERVER_URL : "Enter server URL"}
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
          {!noServerAdded && (
            <button
              className="absolute -right-3 -top-3"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <IconClose />
            </button>
          )}
        </div>
      </Modal>
    </ModalWrapper>
  );
};

export default AddServerModal;
