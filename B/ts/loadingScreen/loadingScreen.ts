import { GameContainer } from "../main/gameContainer";
import { Logo } from "./scenes/logo";
import { BackGround } from "./scenes/background";
export class LoadingScreen extends GameContainer {
    logo : Logo;
    backGround : BackGround
    constructor() {
        super(1920, 1080);
        this.logo = new Logo("loadingLogo")
        this.backGround = new BackGround("loadingBackground")
        this.addChild(this.backGround)
        this.addChild(this.logo)
    }

    resize(){
        this.logo.resize(this.logo.name)
        this.backGround.resize(this.backGround.name)
    }
}