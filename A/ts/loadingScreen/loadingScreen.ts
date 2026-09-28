import { GameContainer } from "../main/gameContainer";
import { engine } from "../utils/engine";
import { LoadingBar } from "./scenes/loadingBar";
import { Logo } from "../gameObjects/Logo";

export class LoadingScreen extends GameContainer {
    logo: Logo;
    private loadingBar!: LoadingBar;

    constructor() {
        super(1920, 1080);
        this.logo = new Logo({name:"loadingLogo", stage:"loadingLogo"});
        this.loadingBar = new LoadingBar("loadingBar");
        this.addChild(this.logo);
        this.addChild(this.loadingBar);
        this.loadingBar.createLoadingBar();
        this.resize()
        engine.eventDispatcher.addCustomListener({type: "loader",name: "pre_loadProgress"},(e: any) => {
                this.loadingBar.updateLoadingProgress(e.data.loadProgressPercentage);
            }
        );
    }

    resize(): void {
        this.logo.resize(this.logo.name);
        this.loadingBar.resize(this.loadingBar.name);
    }
}