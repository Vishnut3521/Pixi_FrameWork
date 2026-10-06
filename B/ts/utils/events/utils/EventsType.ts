export const GameEventType = {
    GAME : "game",
    LOADER : "loader",
    CUSTOM : "custom",
    BUTTON : "button"
} as const;

export type GameEventType = typeof GameEventType[keyof typeof GameEventType];