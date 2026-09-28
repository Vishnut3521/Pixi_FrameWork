import { Image } from "../objects/PixiObjects";
import { objectNotaion } from "../objects/PixiObjects";
export class BackGround extends Image{
    name : string
    constructor(objectNotaion : objectNotaion){
        super(objectNotaion)
        this.name = objectNotaion.name
    }
}

