import { AssetLoader } from "../loader/AssetsLoader";
import { GameApplication } from "./application";
import { LoadingScreen } from "../loadingScreen/loadingScreen";
import { GameObject } from "./GameObject";
import { Engine } from "../utils/engine";
export class Game{

    private application!: GameApplication
    private lodingScreen! : LoadingScreen
    private Engine! : Engine;
    constructor(){
        async function a(game: Game){
            await game.init();
        }
        a(this)
        
    }
    events(this : any){
        window.addEventListener("resize",()=>{
            this.resize()
        })
    }
    async init(): Promise<void> {
        this.Engine = new Engine()
        this.application = new GameApplication();
        await this.application.init();
        const loadAsets = new AssetLoader()
        await loadAsets.loadLoadingAssets()
        this.lodingScreen = new LoadingScreen()
        GameObject.gameContainer.addChild(this.lodingScreen)
        this.events()
        this.resize()
    }
    resize(){
        this.application.resize()
        this.lodingScreen.resize()
    }
}