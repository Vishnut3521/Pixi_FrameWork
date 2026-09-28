import { Assets } from "pixi.js";
import assetConfig from "../../assets/json/assets.json";

type AssetGroup = "loadingScreen" | "gameScreen";

export class AssetLoader {

    public async loadLoadingAssets(): Promise<void> {
        await this.loadAssets("loadingScreen");
    }

    public async loadGameScreenAssets(): Promise<void> {
        await this.loadAssets("gameScreen");
    }

    private async loadAssets(groupName: AssetGroup): Promise<void> {
        const group = assetConfig[groupName];
        const assets = [
            ...Object.entries(group.images).map(([alias, src]) => ({
                alias,
                src
            })),
            ...Object.entries(group.sounds).map(([alias, src]) => ({
                alias,
                src
            })),
            ...Object.entries(group.json).map(([alias, src]) => ({
                alias,
                src
            }))
        ];
        if (assets.length === 0) {
            return;
        }
        await Assets.load(assets);
    }
}