import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  preload() {
    this.load.image("arrow", "/arrow.png");
    this.load.image("heart", "/heart.png");
    }

  create() {
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

    // NO target
    this.noTarget = this.add.rectangle(270, 220, 80, 40, 0x555555);
    this.add.text(270, 220, "NO", { color: "#fff" }).setOrigin(0.5);

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
    this.input.on("pointermove", (pointer) => {
        if (this.arrowFired) return;

        const distance = Phaser.Math.Distance.Between(
            pointer.x,
            pointer.y,
            this.noTarget.x,
            this.noTarget.y
        );

        if (distance < 100) {
            this.tweenNo();
        }
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
      this.endGame("NO 💔");
    });

    this.particles = this.add.particles(0, 0, "heart", {
        speed: { min: 100, max: 300 },
        scale: { start: 0.5, end: 0 },
        lifespan: 800,
        quantity: 20,
        emitting: false,
    });

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

  tweenNo() {
        const newX = Phaser.Math.Between(50, 310);
        const newY = Phaser.Math.Between(180, 300);

        this.tweens.add({
            targets: this.noTarget,
            x: newX,
            y: newY,
            duration: 200,
            ease: "Power2",
        });
    }

    update() {
      if (this.arrowFired) {
        this.arrow.rotation =
          Math.atan2(
            this.arrow.body.velocity.y,
            this.arrow.body.velocity.x
          ) + Math.PI / 2;
      }
    }


  endGame(result) {
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
