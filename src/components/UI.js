import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import chests from "./chests";

const UI = ({ events, chestOverlapState }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [chestKey, setChestKey] = useState("");

  useEffect(() => {
    events.on("chest:overlapped:true", chest => {
      setModalOpen(true);
      setChestKey(chest.tiledProps.key);
    });

    events.on("chest:overlapped:false", () => {
      setModalOpen(false);
    });
  }, []);

  return (
    <>
      <h1>Dev Ed Path</h1>
      <ReactModal isOpen={isModalOpen} ariaHideApp={false}>
        <>
          {chestKey && chests[chestKey]}
          <button
            onClick={() => {
              chestOverlapState.action("exit");
            }}
          >
            Close Modal
          </button>
        </>
      </ReactModal>
    </>
  );
};

export default UI;
