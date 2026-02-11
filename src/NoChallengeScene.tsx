import Phaser from "phaser";

export default class NoChallengeScene extends Phaser.Scene {
  endTriggered = false;

  player!: Phaser.Physics.Arcade.Sprite;
  hearts!: Phaser.Physics.Arcade.Group;

  hits = 0;
  timeLeft = 25;

  hitText!: Phaser.GameObjects.Text;
  timerText!: Phaser.GameObjects.Text;

  constructor() {
    super("no-challenge");
  }

  init() {
    this.endTriggered = false;
    this.hits = 0;
    this.timeLeft = 25;
  }

  preload() {
    this.load.image("unamused", "/face-emotions/unamused-face.png");
    this.load.image("poker", "/face-emotions/poker-face.png");
    this.load.image("amused", "/face-emotions/amused-face.png");
    this.load.image("love", "/face-emotions/love-face.png");
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.cameras.main.setBackgroundColor("#ffe6eb");

    // Player (simple circle / reuse arrow if you want)
    this.player = this.physics.add.sprite(width / 2, height - 80, "unamused");
    this.player.setScale(0.1);
    this.player.setCollideWorldBounds(true);

    // Controls
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      this.player.x = p.x;
    });

    // Hearts group
    this.hearts = this.physics.add.group({
      velocityY: 200,
      bounceY: 0,
    });

    // Spawn hearts
    this.time.addEvent({
      delay: 400,
      loop: true,
      callback: this.spawnHeart,
      callbackScope: this,
    });

    // Collision
    this.physics.add.overlap(
      this.player,
      this.hearts,
      this.onHeartHit,
      undefined,
      this
    );

    // UI
    this.hitText = this.add.text(20, 20, `Hits: ${this.hits} / 15`, {
      fontSize: "16px",
      color: "#ff3366",
    });

    this.timerText = this.add.text(width - 20, 20, `${this.timeLeft}s`, {
      fontSize: "16px",
      color: "#ff3366",
    }).setOrigin(1, 0);

    // Countdown timer
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: this.tick,
      callbackScope: this,
    });
  }

  spawnHeart() {
    const x = Phaser.Math.Between(20, this.scale.width - 20);
    const heart = this.hearts.create(x, -20, "heart");
    heart.setScale(0.1);
  }

  onHeartHit(_player: any, heart: any) {
    heart.destroy();
    this.hits++;

    this.hitText.setText(`Hits: ${this.hits} / 15`);
    this.updateFace();

    if (this.hits >= 15 && !this.endTriggered) {
        this.endTriggered = true;
        this.finishWithLove();
    }
  }

  updateFace() {
    if (this.hits >= 12) {
        this.player.setTexture("love");
    } else if (this.hits >= 6) {
        this.player.setTexture("amused");
    } else if (this.hits >= 3) {
        this.player.setTexture("poker");
    } else {
        this.player.setTexture("unamused");
    }
    }

  tick() {
    if (this.endTriggered) return;

    this.timeLeft--;
    this.timerText.setText(`${this.timeLeft}s`);

    // Increase heart spawn rate when time hits 7 seconds
    if (this.timeLeft === 15) {
      this.time.removeAllEvents();
      
      // Faster spawn - every 250ms instead of 400ms
      this.time.addEvent({
        delay: 200,
        loop: true,
        callback: this.spawnHeart,
        callbackScope: this,
      });

      // Re-add the timer tick
      this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: this.tick,
        callbackScope: this,
      });
    }

    if (this.timeLeft <= 0) {
        this.scene.start("game", { noValidated: true });
    }
  }

  finishWithLove() {
    const { width, height } = this.scale;

    // Stop everything
    this.physics.pause();
    this.time.removeAllEvents();
    this.input.removeAllListeners();

    // Clear remaining hearts
    this.hearts.clear(true, true);

    // Ensure love face
    this.player.setTexture("love");

    // Bring to front
    this.player.setDepth(10);

    // Animate to center & scale up
    this.tweens.add({
        targets: this.player,
        x: width / 2,
        y: height / 2 - 40,
        scale: 0.3, // 3x from 0.1
        duration: 2000,
        ease: "Sine.easeInOut",
    });

    // Text: "I knew it."
    const text = this.add
        .text(width / 2, height / 2 + 80, "I knew it 😏", {
        fontSize: "28px",
        color: "#ff3366",
        fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setAlpha(0);

    this.tweens.add({
        targets: text,
        alpha: 1,
        delay: 1200,
        duration: 800,
        ease: "Power2",
    });

    // Fade out and return to main scene
    this.time.delayedCall(3500, () => {
        this.cameras.main.fadeOut(1500, 255, 230, 235);
    });

    this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
            this.scene.start("game", { fromNoChallenge: true });
        }
    );
  }
}