import { Game } from "./main/game";
import { engine } from "./utils/engine";
import {FileUpload} from "./fileUpload/fileupload";
export class Main extends Game {
    constructor() {
        super();
        new FileUpload();
    }
}

new Main();