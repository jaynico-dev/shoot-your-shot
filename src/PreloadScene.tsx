import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;

  constructor() {
    super("preload");
  }

  preload() {
    const { width, height } = this.scale;

    // Create loading UI
    this.createLoadingUI();

    // Load all game assets
    this.load.image("arrow", "./arrow.png");
    this.load.image("heart", "./heart.png");
    this.load.audio("bgm", "./valentine-bgm.mp3");
    
    // Load NoChallengeScene assets
    this.load.image("unamused", "./face-emotions/unamused-face.png");
    this.load.image("poker", "./face-emotions/poker-face.png");
    this.load.image("amused", "./face-emotions/amused-face.png");
    this.load.image("love", "./face-emotions/love-face.png");

    // Update progress bar as assets load
    this.load.on("progress", (value: number) => {
      this.percentText.setText(Math.floor(value * 100) + "%");
      this.progressBar.clear();
      this.progressBar.fillStyle(0xff3366, 1);
      this.progressBar.fillRect(
        width / 2 - 150,
        height / 2 + 10,
        300 * value,
        30
      );
    });

    this.load.on("complete", () => {
      this.progressBar.destroy();
      this.progressBox.destroy();
      this.loadingText.destroy();
      this.percentText.destroy();
    });
  }

  create() {
    const { width, height } = this.scale;

    // Add a nice fade-in effect
    this.cameras.main.fadeIn(500, 255, 230, 235);

    // Title animation
    const title = this.add.text(width / 2, height / 2 - 100, "💘 Shoot Your Shot 💘", {
      fontSize: "26px",
      color: "#ff3366",
      fontStyle: "bold",
      align: "center"
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 800,
      ease: "Power2"
    });

    // Tap to start
    const startText = this.add.text(width / 2, height / 2 + 80, "Tap to Start", {
      fontSize: "24px",
      color: "#ff3366",
      fontStyle: "bold",
      align: "center"
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: startText,
      alpha: 1,
      duration: 800,
      delay: 400,
      ease: "Power2"
    });

    // Pulse animation
    this.tweens.add({
      targets: startText,
      scale: 1.1,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Start game on tap/click
    this.input.once("pointerdown", () => {
      // Resume audio context (required for browser autoplay policy)
      if (this.sound instanceof Phaser.Sound.WebAudioSoundManager) {
        this.sound.context.resume();
      }
      
      // Start background music
      const bgMusic = this.sound.add("bgm", { 
        loop: true, 
        volume: 0.5 
      });
      bgMusic.play();
      
      this.cameras.main.fadeOut(500, 255, 230, 235);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start("game");
      });
    });
  }

  private createLoadingUI() {
    const { width, height } = this.scale;

    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 - 50, "Loading...", {
      fontSize: "24px",
      color: "#ff3366",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Percentage text
    this.percentText = this.add.text(width / 2, height / 2 + 60, "0%", {
      fontSize: "20px",
      color: "#ff3366",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Progress box (border)
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0xffffff, 0.8);
    this.progressBox.fillRect(width / 2 - 155, height / 2 + 5, 310, 40);
    this.progressBox.lineStyle(3, 0xff3366, 1);
    this.progressBox.strokeRect(width / 2 - 155, height / 2 + 5, 310, 40);

    // Progress bar (will be filled as assets load)
    this.progressBar = this.add.graphics();
  }
}