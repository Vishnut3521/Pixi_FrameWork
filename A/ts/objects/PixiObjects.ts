import { AnimatedSprite, Sprite, FillGradient, Texture, Graphics, TextStyleOptions, Container, Assets, Text, type TextOptions, type ContainerOptions } from "pixi.js";
import { engine, Engine } from "../utils/engine";

export interface TextContainerOptions extends TextOptions {
    id?: string;
    name?: string;
}
export interface TextContainerOptions extends TextOptions {
    id?: string;
    name?: string;
}
export interface GraphicOptions extends ContainerOptions {
    id?: string;
    name?: string;
}
export class resisterObject {
    public static registerObject(name: string, this_: any): void {
        engine.gameObjects.register(name, this_);
    }
}
export interface objectNotaion{
    name : string,
    stage : string
}

export class Image extends Sprite {
    constructor(objectNotaion: objectNotaion) {
        let texture = Assets.get(objectNotaion.stage)
        super(texture);
        this.anchor.set(0.5);
        resisterObject.registerObject(objectNotaion.name, this)
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

    public resize(objectName: string) {
        engine.objectResizer.update(objectName)
    }
}


export class GameText extends Text {
    objectName: string;
    constructor(objectNotation : objectNotaion) {
        super({
            text: objectNotation.stage,
            style: {}
        });
        this.objectName = objectNotation.name;
        resisterObject.registerObject(objectNotation.name, this);
    }

    public setText(text: string): void {
        this.text = text;
    }

    public getText(): string {
        return this.text;
    }

    public setStyle(style: TextStyleOptions): void {
        Object.assign(this.style, style);
    }

    public setColor(color: number): void {
        this.style.fill = color;
    }

    public setGradient(colors: number[]): void {
        if (colors.length === 0) {
            return;
        }

        if (colors.length === 1) {
            this.setColor(colors[0]);
            return;
        }

        const colorStops = colors.map((color, index) => ({
            offset: index / (colors.length - 1),
            color
        }));

        this.style.fill = new FillGradient({
            type: "linear",
            start: { x: 0, y: 0 },
            end: { x: 0, y: 1 },
            colorStops
        });
    }

    public makeWhite(): void {
        this.setColor(0xFFFFFF);
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

    public setAnchor(x: number, y: number = x): this {
        this.anchor.set(x, y);
        return this;
    }
    public setFontSize(size: number): this {
        this.style.fontSize = size;
        return this;
    }

    public resize(objectName: string) {
        engine.objectResizer.update(objectName)
    }

}

export class Graphic extends Container {
    public id: string;
    public name: string;
    constructor(options: GraphicOptions = {}) {
        super(options);
        this.id = options.id ?? '';
        this.name = options.name ?? '';
        resisterObject.registerObject(this.name, this)
    }
    public setPosition(x: number, y: number): this {
        this.position.set(x, y);
        return this;
    }

    public setScale(scale: number): this {
        this.scale.set(scale);
        return this;
    }

    public setSize(width: number, height: number): this {
        this.width = width;
        this.height = height;
        return this;
    }

    public setRotationDegrees(degrees: number): this {
        this.rotation = degrees * Math.PI / 180;
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

    public add(...children: any[]): this {
        this.addChild(...children);
        return this;
    }

    public remove(child: any): this {
        this.removeChild(child);
        return this;
    }

    public dispose(): void {
        this.destroy({
            children: true,
        });
    }

    public resize(objectName: string) {
        engine.objectResizer.update(objectName)
    }
}

export class ButtonImage extends Image {
    name: string;
    clickFunction: any;
    constructor(objectNotation: objectNotaion) {
        super(objectNotation);
        this.name = objectNotation.name
        this.eventMode = "static";
        this.cursor = "pointer";
        this.clickFunction = () => {
            this.ClickEvent()
        }
        this.on('click', this.clickFunction)
    }

    public ClickEvent() {
        return
    }

    private RemoveEvent(type: string) {
        if (type === "click") {
            this.off("click", this.clickFunction);
        }
    }
}

export class Animation extends AnimatedSprite {
    constructor(objectName: string) {
        const spritesheet = Assets.get(objectName);

        if (!spritesheet) {
            throw new Error(
                `Spritesheet "${objectName}" was not loaded.`
            );
        }

        const frames = spritesheet.animations?.["fly"];

        if (!frames || frames.length === 0) {
            throw new Error(
                `Animation "fly" was not found in "${objectName}".`
            );
        }
        super(frames);
        resisterObject.registerObject(objectName, this)
    }
    public resize(objectName: string) {
        engine.objectResizer.update(objectName)
    }
}






