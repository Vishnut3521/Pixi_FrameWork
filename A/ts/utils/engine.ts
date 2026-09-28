import { GameObjects } from "./gameObjects";
import { GameResizer } from "./gameResizer";
import { ObjectResizer } from "./objectResizer";
import { EventDispatcher } from "./events/EventDispatcher";
import { gsap } from "gsap";
export class Engine {
    public readonly gameObjects: GameObjects;
    public readonly gameResizer: GameResizer;
    public readonly objectResizer : ObjectResizer 
    public readonly eventDispatcher: EventDispatcher = new EventDispatcher();
    public readonly gsap: any = gsap;
    public app : any ;
    constructor() {
        this.gameObjects = new GameObjects();
        this.gameResizer = new GameResizer();
        this.objectResizer = new ObjectResizer()
        this.eventDispatcher = new EventDispatcher();
    }
}
export const engine = new Engine();
(window as any).engine = engine;