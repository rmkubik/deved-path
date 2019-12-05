function createHeart(scene, object) {
  // offsets to center heart
  const halfWidth = object.width / 2;
  const halfHeight = object.height / 2;

  const heart = scene.physics.add.sprite(
    object.x + halfWidth,
    object.y - halfHeight,
    "heart"
  );

  heart.setOrigin(0.5, 0.5);

  scene.tweens.add({
    targets: heart,
    scaleX: 1.5,
    scaleY: 1.5,
    ease: "Power1",
    duration: 300,
    yoyo: true,
    repeat: -1
  });

  return heart;
}

export default createHeart;
