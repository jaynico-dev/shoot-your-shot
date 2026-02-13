import Phaser from "phaser";
import PreloadScene from "./PreloadScene";
import GameScene from "./GameScene";
import NoChallengeScene from "./NoChallengeScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: 360,
  height: 640,
  backgroundColor: "#ffe6eb",

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  physics: {
    default: "arcade",
    arcade: { debug: false },
  },

  scene: [PreloadScene, GameScene, NoChallengeScene],
};

new Phaser.Game(config);