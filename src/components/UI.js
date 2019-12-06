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
      <h1 id="title">Becoming a Developer Educator</h1>
      <ReactModal
        isOpen={isModalOpen}
        ariaHideApp={false}
        className="modal animated slideInUp faster"
        overlayClassName="modal-overlay"
      >
        <>
          {chestKey && chests[chestKey]}
          <a
            href=""
            onClick={e => {
              e.preventDefault();
              chestOverlapState.action("exit");
            }}
          >
            Press SPACE to close
          </a>
        </>
      </ReactModal>
    </>
  );
};

export default UI;
