import { engine } from "../../utils/engine";
import { Animation } from "../../objects/PixiObjects";

export class Bird extends Animation {
    objectName = "bird";

    constructor() {
        super("birdSpriteSheet");

        this.anchor.set(0.5);
        this.scale.set(0.5);

        this.animationSpeed = 0.15;
        this.loop = true;

        this.gotoAndStop(0);
    }

    animationPlay(): void {
        this.play();
    }

    stopAnimation(): void {
        this.stop();
    }

    setAnimationSpeed(speed: number): void {
        this.animationSpeed = speed;
    }

    resetAnimation(): void {
        this.gotoAndStop(0);
    }

    setBirdScale(scale: number): void {
        this.scale.set(scale);
    }
}

