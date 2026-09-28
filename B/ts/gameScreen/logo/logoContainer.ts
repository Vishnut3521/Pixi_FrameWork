import { Image } from "../../objects/PixiObjects.js";
import { Assets, Container } from "pixi.js";
export class LogoContainer extends Container {
    constructor() {
        super();
        const logo1 = Assets.get('logo1');
        const logoImage1 = new Image(logo1);
        const logoImage2 = new Image(logo1);
        this.addChild(logoImage1);
        this.addChild(logoImage2);
    }
}