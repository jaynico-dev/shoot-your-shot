import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  arrow!: Phaser.Physics.Arcade.Sprite;
  yesTarget!: Phaser.GameObjects.Rectangle;
  noTarget!: Phaser.GameObjects.Rectangle;
  aimLine!: Phaser.GameObjects.Line;
  particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  arrowFired!: boolean;
  gameOver!: boolean;
  startX!: number;
  startY!: number;

  constructor() {
    super("game");
  }

  preload() {
    this.load.image("arrow", "/arrow.png");
    this.load.image("heart", "/heart.png");
    }

  create() {
    const data = this.scene.settings.data as any;

    if (data?.noValidated) {
      this.endGame("NO 💔 (Confirmed)");
    }

    this.gameOver = false;

    this.scale.on("resize", (gameSize) => {
      const { width, height } = gameSize;
      this.cameras.resize(width, height);
    });


    // Question
    this.add.text(180, 60, "Will you be my Valentine?", {
      fontSize: "20px",
      color: "#ff3366",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // YES target
    this.yesTarget = this.add.rectangle(90, 220, 80, 40, 0xff5c8a);
    this.add.text(90, 220, "YES", { color: "#fff" }).setOrigin(0.5);
    this.yesTarget.setScale(1.5);

    // NO target
    this.noTarget = this.add.rectangle(270, 220, 80, 40, 0x555555);
    this.add.text(270, 220, "NO", { color: "#fff" }).setOrigin(0.5);
    this.noTarget.setScale(0.5);

    this.physics.add.existing(this.yesTarget, true);
    this.physics.add.existing(this.noTarget, true);

    // Arrow
    this.arrow = this.physics.add.sprite(180, 560, "arrow");
    this.arrow.setScale(0.1);
    this.arrow.setCollideWorldBounds(false);
    this.arrow.body.allowGravity = false;
    this.arrowFired = false;
    this.arrow.body.setSize(
      this.arrow.width * 0.3,
      this.arrow.height * 0.8
    );
    this.arrow.body.setOffset(
      this.arrow.width * 0.35,
      this.arrow.height * 0.1
    );


    // Aim line
    this.aimLine = this.add.line(0, 0, 0, 0, 0, 0, 0xff99aa)
      .setLineWidth(2);

    // Input
    this.input.on("pointermove", this.aim, this);
    this.input.on("pointerdown", this.shoot, this);
    this.input.once("pointerdown", () => {
      this.sound.context.resume();
    });


    // Collisions
    this.physics.add.collider(this.arrow, this.yesTarget, () => {
        this.particles.emitParticleAt(
            this.yesTarget.x,
            this.yesTarget.y
        );
        this.endGame("YES 💖");
    });

    this.physics.add.collider(this.arrow, this.noTarget, () => {
      this.scene.start("no-challenge");
    });

    this.particles = this.add.particles(0, 0, "heart", {
        speed: { min: 100, max: 300 },
        scale: { start: 0.5, end: 0 },
        lifespan: 800,
        quantity: 20,
        emitting: false,
    });

    this.startX = this.arrow.x;
    this.startY = this.arrow.y;
  }

  aim(pointer) {
    if (this.arrowFired) return;

    this.aimLine.setTo(
      this.arrow.x,
      this.arrow.y,
      pointer.x,
      pointer.y
    );

    this.arrow.rotation =
      Math.atan2(
        pointer.y - this.arrow.y,
        pointer.x - this.arrow.x
    ) + Math.PI / 2;

  }

  shoot(pointer) {
    if (this.arrowFired) return;

    this.arrowFired = true;
    this.arrow.body.allowGravity = true;

    const dx = pointer.x - this.arrow.x;
    const dy = pointer.y - this.arrow.y;

    this.arrow.body.setVelocity(dx * 2, dy * 2);
    this.aimLine.setVisible(false);
  }

    update() {
      if (this.arrowFired) {
        this.arrow.rotation =
          Math.atan2(
            this.arrow.body.velocity.y,
            this.arrow.body.velocity.x
          ) + Math.PI / 2;

        // If arrow leaves screen → reset
        if (
          this.arrow.y > this.scale.height + 50 ||
          this.arrow.x < -50 ||
          this.arrow.x > this.scale.width + 50
        ) {
          this.resetArrow();
        }
      }
    }

    resetArrow() {
      this.arrowFired = false;

      this.arrow.body.stop();
      this.arrow.body.allowGravity = false;

      this.arrow.setPosition(this.startX, this.startY);
      this.arrow.setRotation(0);

      this.aimLine.setVisible(true);
    }

  endGame(result) {
    if (this.gameOver) return;
    this.gameOver = true;

    this.arrow.body.setVelocity(0);
    this.add.rectangle(180, 320, 280, 120, 0xffffff);
    this.add.text(180, 320, result, {
      fontSize: "28px",
      color: "#ff3366",
      fontStyle: "bold",
    }).setOrigin(0.5);

    const replay = this.add.text(180, 380, "Try again ↺", {
        fontSize: "16px",
        color: "#ff3366",
    }).setOrigin(0.5).setInteractive();

    replay.on("pointerdown", () => {
        this.scene.restart();
    });
  }
}
