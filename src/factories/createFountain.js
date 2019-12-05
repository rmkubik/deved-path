function createFountain(scene, object) {
  const fountain = scene.physics.add.sprite(
    object.x,
    object.y,
    object.type === "fountainTop" ? "fountainTop1" : "fountainBottom1"
  );

  fountain.setOrigin(0, 1);

  fountain.anims.play(
    object.type === "fountainTop" ? "fountainTopRun" : "fountainBottomRun"
  );

  fountain.anims.setRepeat(-1);

  return fountain;
}

export default createFountain;
