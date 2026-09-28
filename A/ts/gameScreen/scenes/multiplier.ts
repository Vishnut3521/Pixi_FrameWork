import { GameText } from "../../objects/PixiObjects";
import { objectNotaion } from "../../objects/PixiObjects";
export class Multiplier extends GameText {
    constructor(objectNotaion : objectNotaion) {
        super(objectNotaion);
        this.anchor.set(0.5)
        this.position.set(0, -300)
        this.setStyle({
            fontFamily: "Orbitron",
            fontSize: 140,
            fontWeight: "700",
            align: "center"
        });
    }
}