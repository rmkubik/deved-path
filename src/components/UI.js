import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import chests from "./chests";

const UI = ({ events }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [chestKey, setChestKey] = useState("");

  useEffect(() => {
    events.on("chest:overlapped:true", chest => {
      setModalOpen(true);
      setChestKey(chest.tiledProps.key);
    });

    events.on("chest:overlapped:false", key => {
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
              setModalOpen(false);
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
