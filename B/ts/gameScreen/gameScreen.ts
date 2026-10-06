import { GameContainer } from "../main/gameContainer";
import { BackGround } from "../gameObjects/background";
import { engine } from "../utils/engine";
import { Bird } from "./scenes/bird";
import { Multiplier } from "./scenes/multiplier";
import { PlaceBetButton } from "./scenes/cashoutButton";
import { CashoutButton } from "./scenes/cashoutButton";

export class GameScreen extends GameContainer {
    background1: BackGround;
    background2: BackGround;
    bird: Bird;
    multiplier: Multiplier;
    
    placeBetBtn: PlaceBetButton;
    cashoutBtn: CashoutButton;

    constructor() {
        super(1920, 1080);

        this.background1 = new BackGround({ name: "backgound1", stage: "gameBackground" });
        this.background2 = new BackGround({ name: "background2", stage: "gameBackground" });
        this.addChild(this.background2);
        this.addChild(this.background1);

        this.setInitialPosition(this.background2, this.background1);
        
        this.bird = new Bird();
        this.multiplier = new Multiplier({ name: "multiplierText", stage: "GAME START" });
        this.bird.x = -1920
        this.bird.setAnimationSpeed(0.3)
        this.addChild(this.bird);
        this.addChild(this.multiplier);

        this.placeBetBtn = new PlaceBetButton("PlaceBet","PLACE BET", {name : "placeBet" , width: 180, height: 50 });
        this.cashoutBtn = new CashoutButton("Cahsout","CASHOUT", {name : "cashout", width: 180, height: 50 });
        this.placeBetBtn.position.set(0, 300);
        this.cashoutBtn.position.set(0, 300);
        this.placeBetBtn.scale = 3
        this.cashoutBtn.scale = 3

        this.placeBetBtn.visible = false
        this.cashoutBtn.visible = false

        this.placeBetBtn.onClick(() => this.onPlaceBetClick());
        this.cashoutBtn.onClick(() => this.onCashoutClick());

        this.cashoutBtn.setDisabled(true);

        this.addChild(this.placeBetBtn);
        this.addChild(this.cashoutBtn);

        this.resize();
    }

    setInitialPosition(background1: any, background2: any) {
        background1.x = background2.width;
    }

    private onPlaceBetClick(): void {
        this.placeBetBtn.setDisabled(true);
        this.cashoutBtn.setDisabled(false);

        engine.eventDispatcher.DISPATCH({ type: "custom", name: "click_button", data: { button: "placeBet" } });
    }

    private onCashoutClick(): void {
        this.cashoutBtn.setDisabled(true);
        this.placeBetBtn.setDisabled(false);

        engine.eventDispatcher.DISPATCH({ type: "custom", name: "click_button", data: { button: "cashout" } });
    }

    resize(): void {
        this.background1.resize(this.background1.name);
        this.multiplier.resize(this.multiplier.objectName);
    }
}