import { GameEventType } from "./utils/EventsType";
import { GameEventMap } from "./utils/GameEventsMap";

export type GameEvent = {
    [T in GameEventType]: {
        type: T;
        name: GameEventMap[T & keyof GameEventMap];
        data: any;
    }
}[GameEventType];

interface EventListener {
    type: GameEventType;
    name: string;
    callback: (event: GameEvent) => void;
}

export class EventDispatcher {
    private listeners: EventListener[] = [];

    public DISPATCH(event: GameEvent): void {
        this.listeners.forEach(listener => {
            if (
                listener.type === event.type &&
                listener.name === event.name
            ) {
                listener.callback(event);
            }
        });
    }

    public addCustomListener(
        event: { type: GameEventType; name: string },
        callback: (event: GameEvent) => void
    ): void {
        this.listeners.push({
            type: event.type,
            name: event.name,
            callback
        });
    }                           
}