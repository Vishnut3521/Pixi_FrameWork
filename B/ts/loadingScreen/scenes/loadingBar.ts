import { Graphics , Text } from "pixi.js";
import { Graphic } from "../../objects/PixiObjects";
export class LoadingBar extends Graphic {
    name : string;
    private loadingBar!: Graphics;
    private loadingBarFill!: Graphics;
    private loadingText!: Text;
    private loadingBarWidth: number = 600;
    private loadingBarHeight: number = 90; 
    constructor(name:string){
        super({name})
        this.name = name
    }
    createLoadingBar(): void {
        this.loadingBar = new Graphics();
        this.loadingBar.roundRect(
            -this.loadingBarWidth / 2,
            -this.loadingBarHeight / 2,
            this.loadingBarWidth,
            this.loadingBarHeight,
            10
        );
        this.loadingBar.fill(0x222222);
        this.loadingBar.position.set(0,0);
        this.addChild(this.loadingBar);
        this.loadingBarFill = new Graphics();
        this.loadingBarFill.roundRect(
            -this.loadingBarWidth / 2,
            -this.loadingBarHeight / 2,
            0,
            this.loadingBarHeight,
            10
        );
        this.loadingBarFill.fill(0x00c853);
        this.loadingBar.addChild(this.loadingBarFill);
        this.loadingText = new Text({
            text: '0%',
            style: {
                fontFamily: 'Arial',
                fontSize: 32,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        });
        this.loadingText.anchor.set(0.5);
        this.loadingText.position.set(0, 0);
        this.loadingBar.addChild(this.loadingText);
    }

    updateLoadingProgress(progress: number): void {
        progress = Math.max(0, Math.min(100, progress));
        const progressWidth =
            (this.loadingBarWidth * progress) / 100;
        this.loadingBarFill.clear();
        this.loadingBarFill.roundRect(
            -this.loadingBarWidth / 2,
            -this.loadingBarHeight / 2,
            progressWidth,
            this.loadingBarHeight,
            10
        );
        this.loadingBarFill.fill(0x00c853);
        this.loadingText.text = `${Math.floor(progress)}%`;
    }
}