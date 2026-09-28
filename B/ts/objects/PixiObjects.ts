import { Sprite, Texture , Graphics , Container , Text , Assets} from "pixi.js";
import { engine, Engine } from "../utils/engine";

export class Image extends Sprite {

    private static engine: Engine;
    public static setEngine(engine: Engine): void {
        Image.engine = engine;
    }
    protected registerObject(name: string): void {
        engine.gameObjects.register(name, this);
    }

    constructor(objectName: string) {
        let texture = Assets.get(objectName)
        super(texture);
        this.anchor.set(0.5);
        this.registerObject(objectName)
    }

    public setPosition(x: number, y: number): this {
        this.position.set(x, y);
        return this;
    }

    public setScale(x: number, y: number = x): this {
        this.scale.set(x, y);
        return this;
    }

    public setSize(width: number, height: number): this {
        this.width = width;
        this.height = height;
        return this;
    }

    public setRotation(rotation: number): this {
        this.rotation = rotation;
        return this;
    }

    public setAlpha(alpha: number): this {
        this.alpha = alpha;
        return this;
    }

    public setVisible(visible: boolean): this {
        this.visible = visible;
        return this;
    }

    public resize(objectName : string){
        engine.objectResizer.update(objectName)
    }
}


export class Button extends Container {

    private static engine: Engine;
    public readonly objectName: string;

    public static setEngine(engine: Engine): void {
        Button.engine = engine;
    }

    protected registerObject(name: string): void {
        engine.gameObjects.register(name, this);
    }

    constructor(objectName: string) {
        super();
        this.objectName = objectName;
        this.registerObject(objectName)
        this.createButton();
    }
    private createButton(): void {
        const background = new Graphics();
        background
            .roundRect(0, 0, 200, 60, 10)
            .fill(0x3498db);
        this.addChild(background);
        const text = new Text({
            text: this.objectName,
            style: {
                fill: 0xffffff,
                fontSize: 24
            }
        });
        text.anchor.set(0.5);
        text.position.set(100, 30);
        this.addChild(text);
    }
}
