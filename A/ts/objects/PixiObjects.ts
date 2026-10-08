import { Graphics, AnimatedSprite, Sprite, FillGradient, TextStyleOptions, Container, Assets, Text, type TextOptions, type ContainerOptions } from "pixi.js";
import { engine } from "../utils/engine";

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

export interface objectNotaion {
    name: string;
    stage: string;
}

export class Image extends Sprite {
    private clickFunction?: () => void;
    private hoverFunction?: () => void;
    private hoverOutFunction?: () => void;

    constructor(objectNotaion: objectNotaion) {
        const texture = Assets.get(objectNotaion.stage);
        super(texture);
        this.anchor.set(0.5);
        resisterObject.registerObject(objectNotaion.name, this);
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

    public setButtonMode(value: boolean): this {
        this.eventMode = value ? "static" : "none";
        this.cursor = value ? "pointer" : "default";
        return this;
    }

    public onClickFunction(callback: () => void): this {
        if (this.clickFunction) {
            this.off("pointertap", this.clickFunction);
        }

        this.clickFunction = callback;
        this.on("pointertap", this.clickFunction);

        return this;
    }

    public onHover(callback: () => void): this {
        if (this.hoverFunction) {
            this.off("pointerover", this.hoverFunction);
        }

        this.hoverFunction = callback;
        this.on("pointerover", this.hoverFunction);

        return this;
    }

    public onHoverOut(callback: () => void): this {
        if (this.hoverOutFunction) {
            this.off("pointerout", this.hoverOutFunction);
        }

        this.hoverOutFunction = callback;
        this.on("pointerout", this.hoverOutFunction);

        return this;
    }

    public resize(objectName: string): void {
        engine.objectResizer.update(objectName);
    }
}

export class GameText extends Text {
    objectName: string;

    private clickFunction?: () => void;
    private hoverFunction?: () => void;
    private hoverOutFunction?: () => void;

    constructor(objectNotation: objectNotaion) {
        super({
            text: objectNotation.stage,
            style: {}
        });

        this.objectName = objectNotation.name;
        this.anchor.set(0.5);
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

    public setButtonMode(value: boolean): this {
        this.eventMode = value ? "static" : "none";
        this.cursor = value ? "pointer" : "default";
        return this;
    }

    public onClickFunction(callback: () => void): this {
        if (this.clickFunction) {
            this.off("pointertap", this.clickFunction);
        }

        this.clickFunction = callback;
        this.on("pointertap", this.clickFunction);

        return this;
    }

    public onHover(callback: () => void): this {
        if (this.hoverFunction) {
            this.off("pointerover", this.hoverFunction);
        }

        this.hoverFunction = callback;
        this.on("pointerover", this.hoverFunction);

        return this;
    }

    public onHoverOut(callback: () => void): this {
        if (this.hoverOutFunction) {
            this.off("pointerout", this.hoverOutFunction);
        }

        this.hoverOutFunction = callback;
        this.on("pointerout", this.hoverOutFunction);

        return this;
    }

    public resize(objectName: string): void {
        engine.objectResizer.update(objectName);
    }
}

export class Graphic extends Container {
    public id: string;
    public name: string;

    private background!: Graphics;
    private graphicWidth: number = 0;
    private graphicHeight: number = 0;

    private clickFunction?: () => void;
    private hoverFunction?: () => void;
    private hoverOutFunction?: () => void;

    constructor(options: GraphicOptions = {}) {
        super(options);

        this.id = options.id ?? "";
        this.name = options.name ?? "";

        this.background = new Graphics();

        this.addChild(this.background);

        resisterObject.registerObject(this.name, this);
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
        this.graphicWidth = width;
        this.graphicHeight = height;
        return this;
    }

    public setBackground(color: number, alpha: number = 1, radius: number = 0): this {
        this.background.clear();
        this.background.roundRect(-this.graphicWidth / 2, -this.graphicHeight / 2, this.graphicWidth, this.graphicHeight, radius);
        this.background.fill({ color, alpha });
        return this;
    }

    public setBorder(color: number, width: number = 2, alpha: number = 1, radius: number = 0): this {
        this.background.roundRect(-this.graphicWidth / 2, -this.graphicHeight / 2, this.graphicWidth, this.graphicHeight, radius);
        this.background.stroke({ color, width, alpha });
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

    public setAnchor(x: number, y: number = x): this {
        this.pivot.set(this.graphicWidth * x, this.graphicHeight * y);
        return this;
    }

    public setButtonMode(value: boolean): this {
        this.eventMode = value ? "static" : "none";
        this.cursor = value ? "pointer" : "default";
        return this;
    }

    public onClickFunction(callback: () => void): this {
        if (this.clickFunction) {
            this.off("pointertap", this.clickFunction);
        }

        this.clickFunction = callback;
        this.on("pointertap", this.clickFunction);

        return this;
    }

    public onHover(callback: () => void): this {
        if (this.hoverFunction) {
            this.off("pointerover", this.hoverFunction);
        }

        this.hoverFunction = callback;
        this.on("pointerover", this.hoverFunction);

        return this;
    }

    public onHoverOut(callback: () => void): this {
        if (this.hoverOutFunction) {
            this.off("pointerout", this.hoverOutFunction);
        }

        this.hoverOutFunction = callback;
        this.on("pointerout", this.hoverOutFunction);

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
        this.destroy({ children: true });
    }

    public resize(objectName: string): void {
        engine.objectResizer.update(objectName);
    }
}

export class ButtonImage extends Image {
    constructor(objectNotation: objectNotaion) {
        super(objectNotation);
        this.setButtonMode(true);
    }
}

export class Animation extends AnimatedSprite {
    private clickFunction?: () => void;
    private hoverFunction?: () => void;
    private hoverOutFunction?: () => void;

    constructor(objectName: string) {
        const spritesheet = Assets.get(objectName);

        if (!spritesheet) {
            throw new Error(`Spritesheet "${objectName}" was not loaded.`);
        }

        const frames = spritesheet.animations?.["fly"];

        if (!frames || frames.length === 0) {
            throw new Error(`Animation "fly" was not found in "${objectName}".`);
        }

        super(frames);

        this.anchor.set(0.5);

        resisterObject.registerObject(objectName, this);
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

    public setButtonMode(value: boolean): this {
        this.eventMode = value ? "static" : "none";
        this.cursor = value ? "pointer" : "default";
        return this;
    }

    public onClickFunction(callback: () => void): this {
        if (this.clickFunction) {
            this.off("pointertap", this.clickFunction);
        }

        this.clickFunction = callback;
        this.on("pointertap", this.clickFunction);

        return this;
    }

    public onHover(callback: () => void): this {
        if (this.hoverFunction) {
            this.off("pointerover", this.hoverFunction);
        }

        this.hoverFunction = callback;
        this.on("pointerover", this.hoverFunction);

        return this;
    }

    public onHoverOut(callback: () => void): this {
        if (this.hoverOutFunction) {
            this.off("pointerout", this.hoverOutFunction);
        }

        this.hoverOutFunction = callback;
        this.on("pointerout", this.hoverOutFunction);

        return this;
    }

    public resize(objectName: string): void {
        engine.objectResizer.update(objectName);
    }
}