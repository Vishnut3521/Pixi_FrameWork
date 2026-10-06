import { GameEventType } from "./EventsType";
import { GameEventName } from "./EventsName";
import { Button } from "../../../../../B/ts/objects/PixiObjects";

export interface GameEventMap {
    [GameEventType.GAME]:
        typeof GameEventName.GAME[keyof typeof GameEventName.GAME];
    [GameEventType.LOADER]:
        typeof GameEventName.LOADER[keyof typeof GameEventName.LOADER];
    [GameEventType.CUSTOM]:
        string;
    [GameEventType.BUTTON]:
        typeof GameEventName.BUTTON[keyof typeof GameEventName.BUTTON]
}