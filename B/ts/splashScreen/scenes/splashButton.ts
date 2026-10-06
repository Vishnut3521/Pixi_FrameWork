import { ButtonImage } from "../../objects/PixiObjects";
import { engine } from "../../utils/engine";
export class SplashButton extends ButtonImage{
    name : string;
    constructor(object : any){
        super(object)
        this.name = object.name
    }

    public ClickEvent(): void {
        engine.eventDispatcher.DISPATCH({type: "button",name: "splash_button",data: {event: "click"}})
    }
}