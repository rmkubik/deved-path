import ReactDOM from "react-dom";
import React from "react";
import Phaser from "phaser";
import EventEmitter from "event-emitter";
import WebFont from "webfontloader";
import "animate.css";

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
import chestEmpty1 from "../assets/frames/chest_empty_open_anim_f0.png";
import chestEmpty2 from "../assets/frames/chest_empty_open_anim_f1.png";
import chestEmpty3 from "../assets/frames/chest_empty_open_anim_f2.png";
import fountainBottom1 from "../assets/frames/wall_fountain_basin_blue_anim_f0.png";
import fountainBottom2 from "../assets/frames/wall_fountain_basin_blue_anim_f1.png";
import fountainBottom3 from "../assets/frames/wall_fountain_basin_blue_anim_f2.png";
import fountainTop1 from "../assets/frames/wall_fountain_mid_blue_anim_f0.png";
import fountainTop2 from "../assets/frames/wall_fountain_mid_blue_anim_f1.png";
import fountainTop3 from "../assets/frames/wall_fountain_mid_blue_anim_f2.png";
import heartImage from "../assets/frames/ui_heart_full.png";

import UI from "./components/UI.js";
import FSM from "./components/FSM";
import createChest from "./factories/createChest";
import createFountain from "./factories/createFountain";
import createHeart from "./factories/createHeart";

import "./styles/main.scss";

WebFont.load({
  google: {
    families: ["Press Start 2P", "Roboto", "Roboto:bold"]
  }
});

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
let heart;
const chestOverlapState = new FSM(
  {
    overlapped: {
      actions: {
        exit: () => {
          events.emit("chest:overlapped:false");
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
  this.load.image("chestEmpty1", chestEmpty1);
  this.load.image("chestEmpty2", chestEmpty2);
  this.load.image("chestEmpty3", chestEmpty3);
  this.load.image("fountainBottom1", fountainBottom1);
  this.load.image("fountainBottom2", fountainBottom2);
  this.load.image("fountainBottom3", fountainBottom3);
  this.load.image("fountainTop1", fountainTop1);
  this.load.image("fountainTop2", fountainTop2);
  this.load.image("fountainTop3", fountainTop3);
  this.load.image("heart", heartImage);
}

function create() {
  this.mapImage = this.add.image(0, 0, "mapImage");
  this.mapImage.setOrigin(0, 0);

  this.anims.create({
    key: "chestOpen",
    frames: [{ key: "chestEmpty2" }, { key: "chestEmpty3" }],
    frameRate: 7
  });

  this.anims.create({
    key: "fountainTopRun",
    frames: [
      { key: "fountainTop1" },
      { key: "fountainTop2" },
      { key: "fountainTop3" }
    ],
    frameRate: 8
  });

  this.anims.create({
    key: "fountainBottomRun",
    frames: [
      { key: "fountainBottom1" },
      { key: "fountainBottom2" },
      { key: "fountainBottom3" }
    ],
    frameRate: 8
  });

  const chestLayer = map.layers.find(layer => layer.name === "objects");
  chestLayer.objects.forEach(object => {
    switch (object.type) {
      case "chest":
        chests.push(createChest(this, object, chestOverlapState));
        break;
      case "fountainTop":
      case "fountainBottom":
        createFountain(this, object);
        break;
      case "heart":
        heart = createHeart(this, object);
        break;
      default:
        console.warn("Unimplemented object type!");
        break;
    }
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
        "chestEmpty1"
      );
      collider.setOrigin(0, 0);
      collider.body.immovable = true;
      collider.body.moves = false;
      collider.visible = false;
      colliders.add(collider);
    }
  });

  // player = this.physics.add.sprite(50, 20, "elfIdle1");
  player = this.physics.add.sprite(250, 200, "elfIdle1");
  player.setOrigin(0.5, 1);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "walk",
    frames: [
      { key: "elfRun1" },
      { key: "elfRun2" },
      { key: "elfRun3" },
      { key: "elfRun4" }
    ],
    frameRate: 8
  });

  this.anims.create({
    key: "idle",
    frames: [
      { key: "elfIdle1" },
      { key: "elfIdle2" },
      { key: "elfIdle3" },
      { key: "elfIdle4" }
    ],
    frameRate: 8
  });

  cursors = this.input.keyboard.createCursorKeys();

  interactKey = this.input.keyboard.addKey("space");
  interactKey.on("down", event => {
    const isHeartOverlapped = this.physics.overlap(player, heart);

    if (
      isHeartOverlapped &&
      chestOverlapState.currentState === "notOverlapped"
    ) {
      chestOverlapState.action("enter", heart);
      return;
    }

    const overlappedChest = chests.find(chest =>
      this.physics.overlap(player, chest)
    );

    if (chestOverlapState.currentState === "overlapped") {
      chestOverlapState.action("exit");
      return;
    }

    if (overlappedChest) {
      overlappedChest.opened.action("open");
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
