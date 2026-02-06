import Phaser from "phaser";
import GameScene from "./GameScene";

const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  backgroundColor: "#ffe6eb",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 600 },
      debug: false,
    },
  },
  scene: [GameScene],
};

new Phaser.Game(config);
