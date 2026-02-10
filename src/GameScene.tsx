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

    const messages = [
      "Whoa! Hearts everywhere! 😵 Did Cupid just attack you?",
      "Ouch! Love overload! 💘 Back to the question!",
      "Missed your chance! 😅 The hearts had other plans!",
      "Hearts got you! ❤️‍🔥 Don't worry… love bites sometimes!",
      "Oof… crushed by hearts! 💔😂 Love is ruthless!",
      "Ooh that Hearts… Cupid laughs at your aim! 💘",
      "Cupid's trolling you! 😎💘 Aim better next time!",
      "Dodging hearts is harder than dodging love! ❤️💨",
      "Oops! Someone got heartbroken 😏… But love waits!",
      "Yikes! Hearts everywhere! ❤️🤯 Even arrows can't save you!",
      "So close… yet so covered in love! 💖😂",
      "Careful! Love comes at you fast! 💘💨"
    ];

    const msgText = messages[Phaser.Math.Between(0, messages.length - 1)];

    // If returning from NoChallengeScene after failing (hit 15 hearts)
    if (data?.fromNoChallenge) {
        const { width, height } = this.scale;
        const msg = this.add.text(width / 2, height / 2, 
            msgText, {
            fontSize: "20px",
            color: "#ff3366",
            fontStyle: "bold",
            align: "center",
            wordWrap: { width: 300 }
        }).setOrigin(0.5);

        // Animate it to appear and fade
        msg.setAlpha(0);
        this.tweens.add({
            targets: msg,
            alpha: 1,
            duration: 1000,
            ease: "Power2",
            yoyo: true,
            hold: 3500,
            onComplete: () => msg.destroy()
        });
    }

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

    if (result.includes("YES")) {
      // Special YES celebration!
      const { width, height } = this.scale;
      
      // Infinite fireworks of hearts everywhere!
      const heartExplosion = () => {
        this.particles.emitParticleAt(
          Phaser.Math.Between(50, width - 50),
          Phaser.Math.Between(100, height - 100)
        );
      };

      // Initial burst
      for (let i = 0; i < 8; i++) {
        this.time.delayedCall(i * 200, heartExplosion);
      }

      // Continue infinitely every 300ms
      this.time.addEvent({
        delay: 300,
        callback: heartExplosion,
        loop: true
      });

      // Playful messages that rotate
      const yesMessages = [
        "BULLSEYE! 🎯💘\nKnew you had it in you!",
        "HA! You actually did it! 😎\nCupid would be proud!",
        "YESSS! 🎉💖\nBest. Shot. Ever.",
        "YOU DID IT! 💘✨\nWorth all those misses, huh?",
        "BOOM! Direct hit! 💥❤️\nYou're officially smooth!",
        "NAILED IT! 🏹💕\nGuess love wins after all!",
        "SCORE! 🎊💖\nThat's my Valentine!",
        "PERFECT AIM! 🎯❤️\nCupid's got nothing on you!"
      ];

      const chosenMsg = yesMessages[Phaser.Math.Between(0, yesMessages.length - 1)];

      // Animated background
      const bg = this.add.rectangle(width / 2, height / 2, width, height, 0xff3366, 0);
      this.tweens.add({
        targets: bg,
        alpha: 0.15,
        duration: 500,
        yoyo: true,
        repeat: 3
      });

      // Main message box
      const msgBox = this.add.rectangle(width / 2, height / 2, 280, 160, 0xffffff);
      msgBox.setStrokeStyle(4, 0xff3366);
      msgBox.setScale(0);

      const msgText = this.add.text(width / 2, height / 2 - 20, chosenMsg, {
        fontSize: "22px",
        color: "#ff3366",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 250 }
      }).setOrigin(0.5).setAlpha(0);

      // Cheeky subtitle
      const subText = this.add.text(width / 2, height / 2 + 50, 
        "Finally got the right one! 😏", {
        fontSize: "14px",
        color: "#666",
        fontStyle: "italic",
        align: "center"
      }).setOrigin(0.5).setAlpha(0);

      // Animate everything in
      this.tweens.add({
        targets: msgBox,
        scale: 1,
        duration: 400,
        ease: "Back.easeOut"
      });

      this.tweens.add({
        targets: [msgText, subText],
        alpha: 1,
        duration: 600,
        delay: 200
      });

      // Make YES target pulse with joy INFINITELY
      this.tweens.add({
        targets: this.yesTarget,
        scaleX: 1.7,
        scaleY: 1.7,
        duration: 300,
        yoyo: true,
        repeat: -1  // -1 means infinite!
      });

    } else {
      // NO result (confirmed rejection)
      this.add.rectangle(180, 320, 280, 120, 0xffffff);
      this.add.text(180, 320, result, {
        fontSize: "28px",
        color: "#ff3366",
        fontStyle: "bold",
      }).setOrigin(0.5);
    }
  }
}