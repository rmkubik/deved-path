import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import chests from "./chests";

const UI = ({ events, chestOverlapState }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [chestKey, setChestKey] = useState("");
  const [isGameFullScreen, setIsGameFullScreen] = useState(false);

  useEffect(() => {
    events.on("chest:overlapped:true", (chest) => {
      setModalOpen(true);
      setChestKey(chest.tiledProps.key);
    });

    events.on("chest:overlapped:false", () => {
      setModalOpen(false);
    });

    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) console.info("We are fullscreen!!!");
      else console.info("Do nothing...");
    });
  }, []);

  return (
    <>
      <h1 id="title">Becoming a Developer Educator</h1>
      <p>
        This is a short autobiographical experience created by me,{" "}
        <a href="https://ryankubik.com">Ryan Kubik</a>.
      </p>
      <p>
        For our last team summit, we were tasked to reflect on the path that led
        us to working as Developer Educators at{" "}
        <a href="https://www.twilio.com/">Twilio</a>. Each chest contains a clue
        from my past that I would end up in this bizarre and exciting role at
        the intersection of games, education, and code.
      </p>
      <p>Arrow Keys to move. SPACE to interact.</p>
      <button
        onClick={() => {
          setIsGameFullScreen(true);

          const gameContainer = document.getElementById("game");
          gameContainer.addEventListener("fullscreenerror", (...err) => {
            console.log(err);
          });

          console.log({ gameContainer });

          gameContainer
            .requestFullscreen({ navigationUI: "hide" })
            .catch(console.log);

          console.log("hello");
        }}
      >
        Full Screen
      </button>
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
            onClick={(e) => {
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
