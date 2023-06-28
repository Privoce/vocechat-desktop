import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLazyGetServerInfoQuery } from "@/app/services/data";
import { addServer, updateAddModalVisible } from "@/app/slices/data";
import Button from "./base/button";
import Input from "./base/input";

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
    dispatch(updateAddModalVisible(false));
  };
  return (
    <div className="bg-white dark:bg-gray-900 w-screen h-screen text-lg flex items-center justify-center">
      <form action="" className="w-56 flex flex-col gap-4">
        <Input
          type="text"
          className="w-56"
          data-type="api_url"
          placeholder="input server url"
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <Button onClick={handleAdd} disabled={isLoading}>
            {isLoading ? "Adding" : `Add`}
          </Button>
          <Button mode="ghost" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddViewModal;
