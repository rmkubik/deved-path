import ReactDOM from "react-dom";
import React from "react";
import Phaser from "phaser";
import EventEmitter from "event-emitter";
import WebFont from "webfontloader";

import spritesheet from "../assets/player_tilesheet.png";
import elfHit from "../assets/frames/elf_m_hit_anim_f0.png";
import elfIdle1 from "../assets/frames/elf_m_idle_anim_f0.png";
import elfIdle2 from "../assets/frames/elf_m_idle_anim_f1.png";
import elfIdle3 from "../assets/frames/elf_m_idle_anim_f2.png";
import elfIdle4 from "../assets/frames/elf_m_idle_anim_f3.png";
import elfRun1 from "../assets/frames/elf_m_run_anim_f0.png";
import elfRun2 from "../assets/frames/elf_m_run_anim_f1.png";
import elfRun3 from "../assets/frames/elf_m_run_anim_f2.png";
import elfRun4 from "../assets/frames/elf_m_run_anim_f3.png";
import map from "../assets/map.json";
import mapImage from "../assets/map.png";
import chestClosed from "../assets/frames/chest_full_open_anim_f0.png";

import UI from "./components/UI.js";
import FSM from "./components/FSM";

import "./styles/main.scss";

WebFont.load({
  google: {
    families: ["Press Start 2P", "Roboto", "Roboto:bold"]
  }
});

function getTiledProp(obj, prop) {
  return (
    obj &&
    obj.properties &&
    obj.properties.find(property => property.name === prop).value
  );
}

const config = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0072bc",
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  width: 480,
  height: 480,
  scale: {
    mode: Phaser.Scale.FIT
  },
  pixelArt: true
};

const events = new EventEmitter();
const game = new Phaser.Game(config);

let interactKey;
let player;
let cursors;
let chests = [];
const chestOverlapState = new FSM(
  {
    overlapped: {
      actions: {
        exit: chest => {
          events.emit("chest:overlapped:false", chest);
          chestOverlapState.transition("notOverlapped");
        }
      }
    },
    notOverlapped: {
      actions: {
        enter: chest => {
          events.emit("chest:overlapped:true", chest);
          chestOverlapState.transition("overlapped");
        }
      }
    }
  },
  "notOverlapped"
);
let colliders;

ReactDOM.render(
  <UI events={events} chestOverlapState={chestOverlapState} />,
  document.getElementById("ui")
);

function preload() {
  this.load.spritesheet("sprites", spritesheet, {
    frameWidth: 80,
    frameHeight: 110
  });
  this.load.image("elfHit", elfHit);
  this.load.image("elfIdle1", elfIdle1);
  this.load.image("elfIdle2", elfIdle2);
  this.load.image("elfIdle3", elfIdle3);
  this.load.image("elfIdle4", elfIdle4);
  this.load.image("elfRun1", elfRun1);
  this.load.image("elfRun2", elfRun2);
  this.load.image("elfRun3", elfRun3);
  this.load.image("elfRun4", elfRun4);
  this.load.image("mapImage", mapImage);
  this.load.image("chestClosed", chestClosed);
}

function create() {
  this.mapImage = this.add.image(0, 0, "mapImage");
  this.mapImage.setOrigin(0, 0);

  const chestLayer = map.layers.find(layer => layer.name === "chests");
  chestLayer.objects.forEach(object => {
    const chest = this.physics.add.sprite(object.x, object.y, "chestClosed");
    chest.setOrigin(0, 1);
    chest.tiledProps = {};
    chest.tiledProps.key = getTiledProp(object, "key") || "";
    chest.fsm = new FSM(
      {
        overlapped: {
          actions: {
            exit: () => {
              chest.fsm.transition("notOverlapped");
            }
          },
          onEnter: () => {
            this.tweens.add({
              targets: chest,
              scaleX: 1.2,
              scaleY: 1.2,
              ease: "Power1",
              duration: 100
            });
          }
        },
        notOverlapped: {
          actions: {
            enter: () => {
              chest.fsm.transition("overlapped");
            }
          },
          onEnter: () => {
            this.tweens.add({
              targets: chest,
              scaleX: 1,
              scaleY: 1,
              ease: "Power1",
              duration: 100
            });
          }
        }
      },
      "notOverlapped"
    );
    chests.push(chest);
  });

  colliders = this.physics.add.group();
  const collisionLayer = map.layers.find(layer => layer.name === "collision");
  collisionLayer.data.forEach((id, index) => {
    if (id !== 0) {
      const row = index % 30;
      const col = Math.floor(index / 30);
      const collider = this.physics.add.sprite(
        row * 16,
        col * 16,
        "chestClosed"
      );
      collider.setOrigin(0, 0);
      collider.body.immovable = true;
      collider.body.moves = false;
      collider.visible = false;
      colliders.add(collider);
    }
  });

  player = this.physics.add.sprite(50, 20, "elfIdle1");
  player.setOrigin(0.5, 1);
  player.setCollideWorldBounds(true);

  var config = {
    key: "walk",
    frames: [
      { key: "elfRun1" },
      { key: "elfRun2" },
      { key: "elfRun3" },
      { key: "elfRun4" }
    ],
    frameRate: 8
  };

  this.anims.create(config);

  var config = {
    key: "idle",
    frames: [
      { key: "elfIdle1" },
      { key: "elfIdle2" },
      { key: "elfIdle3" },
      { key: "elfIdle4" }
    ],
    frameRate: 8
  };

  this.anims.create(config);

  cursors = this.input.keyboard.createCursorKeys();

  interactKey = this.input.keyboard.addKey("space");
  interactKey.on("down", event => {
    const overlappedChest = chests.find(chest =>
      this.physics.overlap(player, chest)
    );

    if (chestOverlapState.currentState === "overlapped") {
      chestOverlapState.action("exit");
      return;
    }

    if (overlappedChest) {
      chestOverlapState.action("enter", overlappedChest);
    }
  });
}

const RUN_SPEED = 150;
function update() {
  player.setVelocity(0);

  // const overlappedChest = chests.find(chest =>
  //   this.physics.overlap(player, chest)
  // );
  // if (overlappedChest) {
  //   chestOverlapState.action("enter", overlappedChest);
  // } else {
  //   chestOverlapState.action("exit", overlappedChest);
  // }

  chests.forEach(chest => {
    if (this.physics.overlap(player, chest)) {
      chest.fsm.action("enter");
    } else {
      chest.fsm.action("exit");
    }
  });

  this.physics.collide(player, colliders);

  if (cursors.left.isDown) {
    player.setVelocityX(-RUN_SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(RUN_SPEED);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-RUN_SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(RUN_SPEED);
  }

  if (player.body.velocity.x !== 0 || player.body.velocity.y !== 0) {
    player.anims.play("walk", true);
    player.flipX = false;
  } else {
    player.anims.stop("walk");
    player.setFrame(0);
  }

  if (player.body.velocity.x < 0) {
    player.flipX = true;
  }
}
