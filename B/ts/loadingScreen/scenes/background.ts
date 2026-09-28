import { Image } from "../../objects/PixiObjects";
export class BackGround extends Image{
    name : string
    constructor(objectName : string){
        super(objectName)
        this.name = objectName
    }
}