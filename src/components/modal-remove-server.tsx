// import React from "react";
import ModalWrapper from "./base/modal-wrapper";
import Modal from "./base/modal";
import Button from "./base/button";
import { useAppSelector } from "@/app/store";
import { useDispatch } from "react-redux";
import { removeServer } from "@/app/slices/data";

type Props = {
  webUrl: string;
  handleCancel: () => void;
};

const RemoveServerModal = ({ webUrl, handleCancel }: Props) => {
  const dispatch = useDispatch();
  const server = useAppSelector((store) => store.data.servers.find((s) => s.web_url == webUrl));
  const handleRemove = () => {
    if (!server) return;
    dispatch(removeServer(server?.web_url));
    handleCancel();
  };
  if (!server) return null;
  const { name } = server;
  return (
    <ModalWrapper>
      <Modal
        buttons={
          <>
            <Button onClick={handleCancel} mode="ghost">
              Cancel
            </Button>
            <Button onClick={handleRemove} mode="danger">
              Remove Server
            </Button>
          </>
        }
        title={`Remove ${name}`}
        description={`Are you sure you want to remove ${name}? `}
      ></Modal>
    </ModalWrapper>
  );
};

export default RemoveServerModal;
