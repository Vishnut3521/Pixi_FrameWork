import {Image} from '../../objects/PixiObjects.js';
import {Assets, Texture} from 'pixi.js';
export class ReelFrame extends Image {
    constructor() {
        const texture1 = Assets.get('reelFrame') as Texture;
        super(texture1);
    } 
}