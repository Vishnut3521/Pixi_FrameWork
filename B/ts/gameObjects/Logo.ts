import {Image , resisterObject } from "../objects/PixiObjects";
import { objectNotaion } from "../objects/PixiObjects";
export class Logo extends Image{
    name : string       
    constructor(objectNotation : objectNotaion){
        super(objectNotation);
        this.name = objectNotation.name
    }
}