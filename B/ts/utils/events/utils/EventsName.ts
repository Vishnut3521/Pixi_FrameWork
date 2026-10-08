export const GameEventName = {
    GAME: {
        START: "start",
        END: "end",
        SPIN_START: "spinStart",
        SPIN_END: "spinEnd",
        SPLASH_SCREEN : "splash_screen",
        LOADING_SCREEN : "loading_screen",
        GAME_SCREEN : "game_screen",
        RESIZE : "resize"
    },

    LOADER: {
        START_LOADING: "start_loading",
        LOAD_START: "load_start",
        LOAD_PROGRESS: "load_progress",
        LOAD_COMPLETE: "load_complete",
        PRE_LOADSTART: "pre_loadStart",
        PRE_LOADPROGRESS: "pre_loadProgress",
        PRE_LOADCOMPLETE: "pre_loadComplete",
        POST_LOADSTART: "post_loadStart",
        POST_LOADPROGRESS: "post_loadProgress",
        POST_LOADCOMPLETE: "post_loadComplete",
        LOAD_FINISH: "load_finish",
        CONTINUE_PROGRESS_LOAD: "continue_progress_load",
        ASSET_LOAD_ERROR: "asset_load_error"
    },
    BUTTON:{
        SPLASH_BUTTON : "splash_button"
    }
} as const;

export type GameEventName = typeof GameEventName[keyof typeof GameEventName];