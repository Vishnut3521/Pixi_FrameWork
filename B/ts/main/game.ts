
import { AssetLoader } from "../loader/AssetsLoader";
import { GameApplication } from "./application";
import { LoadingScreen } from "../loadingScreen/loadingScreen";
import { GameObject } from "./GameObject";
import { engine, Engine } from "../utils/engine";
import { SplashScreen } from "../splashScreen/splashScreen";
import { GameScreen } from "../gameScreen/gameScreen";

export class Game {
    private application!: GameApplication;
    private lodingScreen: LoadingScreen | null = null;
    private gameScreen: GameScreen | null = null;
    private splashScreen: SplashScreen | null = null;
    private Engine!: Engine;
    private loadAsets!: AssetLoader;

    constructor() {
        this.start();
    }

    private async start(): Promise<void> {
        await this.initEventListeners();
        await this.init();
    }

    events(): void {
        window.addEventListener("resize", () => this.resize());
    }

    private async initEventListeners(): Promise<void> {
        engine.eventDispatcher.addCustomListener({ type: "loader", name: "load_complete" }, (e: any) => {
            engine.eventDispatcher.DISPATCH({ type: "game", name: "loading_screen", data: {} });
            this.loadAsets.loadGameScreenAssets();
        });

        engine.eventDispatcher.addCustomListener({ type: "loader", name: "pre_loadComplete" }, (e: any) => {
            engine.eventDispatcher.DISPATCH({ type: "game", name: "splash_screen", data: {} });
        });

        engine.eventDispatcher.addCustomListener({ type: "button", name: "splash_button" }, (e: any) => {
            if (e.data.event === "click") {
                engine.eventDispatcher.DISPATCH({ type: "game", name: "game_screen", data: {} });
            }
        });

        engine.eventDispatcher.addCustomListener({ type: "game", name: "loading_screen" }, (e: any) => {
            this.switchScreen("loading");
        });

        engine.eventDispatcher.addCustomListener({ type: "game", name: "splash_screen" }, (e: any) => {
            this.switchScreen("splash");
        });

        engine.eventDispatcher.addCustomListener({ type: "game", name: "game_screen" }, (e: any) => {
            this.switchScreen("game");
        });
    }

    private destroyAllScreens(): void {
        this.lodingScreen?.destroy({ children: true });
        this.splashScreen?.destroy({ children: true });
        this.gameScreen?.destroy({ children: true });

        this.lodingScreen = null;
        this.splashScreen = null;
        this.gameScreen = null;
    }

    private switchScreen(screen: "loading" | "splash" | "game"): void {
        this.destroyAllScreens();

        if (screen === "loading") {
            this.lodingScreen = new LoadingScreen();
            GameObject.gameContainer.addChild(this.lodingScreen);
        } else if (screen === "splash") {
            this.splashScreen = new SplashScreen();
            GameObject.gameContainer.addChild(this.splashScreen);
        } else if (screen === "game") {
            this.gameScreen = new GameScreen();
            GameObject.gameContainer.addChild(this.gameScreen);
        }
    }

    async init(): Promise<void> {
        this.Engine = new Engine();
        this.application = new GameApplication();
        await this.application.init();
        this.loadAsets = new AssetLoader();
        await this.loadAsets.loadLoadingAssets();
        this.events();
        this.resize();
    }

    resize(): void {
        this.application.resize(() => {
            this.lodingScreen?.resize();
            this.splashScreen?.resize();
            this.gameScreen?.resize();
        });
    }
}