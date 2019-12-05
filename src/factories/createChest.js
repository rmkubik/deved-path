import getTiledProp from "./getTiledProp";
import FSM from "../components/FSM";

function createChest(scene, object, chestOverlapState) {
  // offsets to center chest
  const halfWidth = object.width / 2;
  const halfHeight = object.height / 2;

  const chest = scene.physics.add.sprite(
    object.x + halfWidth,
    object.y - halfHeight,
    "chestEmpty1"
  );

  chest.setOrigin(0.5, 0.5);

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
          scene.tweens.add({
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
          scene.tweens.add({
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

  chest.opened = new FSM(
    {
      opened: {
        actions: {
          open: () => chestOverlapState.action("enter", chest)
        },
        onEnter: () => {
          chest.anims.play("chestOpen");
        }
      },
      closed: {
        actions: {
          open: () => {
            chest.opened.transition("opened");
          }
        }
      }
    },
    "closed"
  );

  chest.on("animationcomplete", animation => {
    if (animation.key === "chestOpen") {
      chestOverlapState.action("enter", chest);
    }
  });

  return chest;
}

export default createChest;
