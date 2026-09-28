import { GameObjects } from "./gameObjects";
import { GameResizer } from "./gameResizer";
import { ObjectResizer } from "./objectResizer";
export class Engine {
    public readonly gameObjects: GameObjects;
    public readonly gameResizer: GameResizer;
    public readonly objectResizer : ObjectResizer 
    constructor() {
        this.gameObjects = new GameObjects();
        this.gameResizer = new GameResizer();
        this.objectResizer = new ObjectResizer()
    }
}
export const engine = new Engine();
(window as any).engine = engine;