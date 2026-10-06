import configJson from "../../assets/json/config.json";
export class Config {
    private static instance: Config;

    [key: string]: any;

    private constructor() {
        Object.assign(this, structuredClone(configJson));
    }

    public static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }

        return Config.instance;
    }
}