import { Container } from "pixi.js";
import { GameContainer } from "./gameContainer";

export class GameObject extends Container {

    public static gameContainer: GameContainer;

    constructor(width: number = 1920,height: number = 1080) {
        super();
        GameObject.gameContainer = new GameContainer(width,height);
        this.addChild(GameObject.gameContainer);
    }

    public resize(width: number,height: number): void {
        GameObject.gameContainer.resize(width,height);
        this.position.set(width / 2,height / 2);
    }
}