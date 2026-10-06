export type AssetGroup = "loading" | "preLoad" | "postLoad";

export type GameConfig = {
    json: {
        config?: string;
        manifest?: string;
        sounds?: string;
    };
    soundsEnabled: boolean;
    loadingScreen: boolean;
    splashScreen: boolean;
    gameScreen: boolean;
};

export type ManifestGroup = {
    images?: Record<string, string>;
    sounds?: Record<string, string>;
    json?: Record<string, string>;
    spine?: Record<string, { json: string; atlas: string }>;
};

export type Manifest = {
    loading?: ManifestGroup;
    preLoad?: ManifestGroup;
    postLoad?: ManifestGroup;
};

export type AssetType = "image" | "json" | "sound" | "spine-json" | "spine-atlas";

export type AssetDefinition = {
    alias: string;
    src: string;
    type: AssetType;
};

export type AssetError = {
    alias: string;
    url: string;
    type: AssetType | "control-json";
    error: unknown;
};