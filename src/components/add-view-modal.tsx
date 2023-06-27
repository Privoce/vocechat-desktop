import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ipcRenderer } from "electron";
import { useLazyGetServerInfoQuery } from "@/app/services/data";
import { addServer } from "@/app/slices/data";

// type Props = {};

const AddViewModal = () => {
  const dispatch = useDispatch();
  const [getServerInfo, { data, isSuccess, isLoading }] = useLazyGetServerInfoQuery();
  const [inputs, setInputs] = useState({
    name: "",
    web_url: "",
    api_url: ""
  });
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
    await getServerInfo(api_url);
    // console.log(res);
    // dispatch(addServer(inputs));
  };
  const handleCancel = () => {
    ipcRenderer.send("add-view-modal", { visible: false });
  };
  return (
    <div className="bg-white w-screen h-screen flex flex-col gap-3 text-lg items-center justify-center">
      <input type="text" data-type="api_url" placeholder="server api url" onChange={handleChange} />
      <div className="flex gap-2">
        <button onClick={handleAdd} disabled={isLoading}>
          Add
        </button>
        <button onClick={handleCancel} disabled={isLoading}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddViewModal;
