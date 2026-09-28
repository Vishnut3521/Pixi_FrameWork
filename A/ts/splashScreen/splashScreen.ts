import { GameContainer } from "../main/gameContainer";
import { BackGround } from "../gameObjects/background";
import { SplashButton } from "./scenes/splashButton";
export class SplashScreen extends GameContainer {
    backGround: BackGround;
    splashButton : SplashButton
    constructor(){
        super(1920, 1080);
        this.backGround = new BackGround({name :"splashScreenBackground", stage:"splashScreenBackground"}); 
        this.splashButton = new SplashButton({name :"splahButton" , stage :"splahButton"})
        this.addChild(this.backGround);
        this.addChild(this.splashButton)
        this.resize()
    }

    resize(){
        this.backGround.resize(this.backGround.name)
        this.splashButton.resize(this.splashButton.name)
    }
}