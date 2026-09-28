import { Assets } from "pixi.js";
export class Background extends Image {

    constructor() {
        const texture = Assets.get("background");
        super(texture);
    }
}