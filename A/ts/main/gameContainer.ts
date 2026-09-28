import { Container, Graphics } from "pixi.js";

export class GameContainer extends Container {

    public readonly content: Container;

    private readonly layout: Graphics;

    public layoutWidth: number;
    public layoutHeight: number;

    constructor(width: number = 1920,height: number = 1080) {
        super();
        this.layoutWidth = width;
        this.layoutHeight = height;

        this.layout = new Graphics();

        this.content = new Container();

        this.addChild(this.layout);
        this.addChild(this.content);
    }

    public resize(width: number,height: number): void {
        this.layoutWidth = width;
        this.layoutHeight = height;
        this.layout.clear();
        this.layout.rect(-width / 2,-height / 2,width,height).fill({color: 0x000000,alpha: 0});
    }
}