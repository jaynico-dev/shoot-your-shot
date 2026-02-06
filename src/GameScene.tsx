import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  create() {
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
    this.arrow = this.add.rectangle(180, 560, 6, 40, 0x333333);
    this.physics.add.existing(this.arrow);
    this.arrow.body.allowGravity = false;
    this.arrowFired = false;

    // Aim line
    this.aimLine = this.add.line(0, 0, 0, 0, 0, 0, 0xff99aa)
      .setLineWidth(2);

    // Input
    this.input.on("pointermove", this.aim, this);
    this.input.on("pointerdown", this.shoot, this);

    // Collisions
    this.physics.add.collider(this.arrow, this.yesTarget, () => {
      this.endGame("YES 💖");
    });

    this.physics.add.collider(this.arrow, this.noTarget, () => {
      this.endGame("NO 💔");
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

  endGame(result) {
    this.arrow.body.setVelocity(0);
    this.add.rectangle(180, 320, 280, 120, 0xffffff);
    this.add.text(180, 320, result, {
      fontSize: "28px",
      color: "#ff3366",
      fontStyle: "bold",
    }).setOrigin(0.5);
  }
}
