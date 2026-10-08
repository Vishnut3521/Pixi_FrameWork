import { Graphic } from "../../objects/PixiObjects";
import { engine } from "../../utils/engine";
export class BrowseButton extends Graphic{
    name : string;
    constructor(object : any){
        super(object)
        this.name = object.name
        this.setButtonMode(true)
        this.onClickFunction(this.clickEvent)
    }
    clickEvent(): void {
        engine.eventDispatcher.DISPATCH({type: "custom",name: "open_file_dialog",data: {event: "click"}})
    }


}