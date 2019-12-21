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
      <p>
        This is a short autobiographical experience created by me, <a href="https://ryankubik.com">Ryan Kubik</a>.
      </p>
      <p>
        For our last team summit, we were tasked to reflect on the path that lead us to working as Developer Educators at <a href="https://www.twilio.com/">Twilio</a>. Each chest contains a clue from my past that I would end up in this bizarre and exciting role at the intersection of games, education, and code.
      </p>
      <p>Arrow Keys to move. SPACE to interact.</p>
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
