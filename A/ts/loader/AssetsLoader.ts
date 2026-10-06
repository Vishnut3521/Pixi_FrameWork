import { Assets } from "pixi.js";
import { engine } from "../utils/engine";
import { AssetDefinition, AssetError, AssetGroup, GameConfig, Manifest, ManifestGroup } from "./AssetsType";

export class AssetLoader {
    private totalAssets = 0;
    private loadedAssets = 0;
    private config: GameConfig;
    private assetConfig: Manifest = {};
    private jsonFiles: Record<string, any> = {};
    private assetUrls = new Map<string, string>();
    private errors: AssetError[] = [];
    private jsonBasePath: string;

    constructor(config: GameConfig, jsonBasePath = "assets/json") {
        this.config = config;
        this.jsonBasePath = jsonBasePath;
        this.initialize().catch((error) => {
            console.error("Error initializing AssetLoader:", error);
        });
    }

    public async initialize(): Promise<void> {
        if(this.config){
            await this.loadJson("config")
        }
        if (this.config.json?.manifest) {
            const manifest = await this.loadJson(this.config.json.manifest);
            if (manifest) {
                this.assetConfig = manifest;
            }
        }

        if (this.config.soundsEnabled && this.config.json?.sounds) {
            await this.loadJson(this.config.json.sounds);
        }

        this.registerAssetUrls();
        await this.loadLoadingAssets();
    }

    private async loadJson(name: string): Promise<any | null> {
        const fileName = name.endsWith(".json") ? name : `${name}.json`;
        const url = `${this.jsonBasePath}/${fileName}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            this.jsonFiles[name] = data;
            return data
        } catch (error) {
            this.handleError({
                alias: name,
                url,
                type: "control-json",
                error
            });
            return null;
        }
    }

    private registerAssetUrls(): void {
        for (const groupName of ["loading", "preLoad", "postLoad"] as AssetGroup[]) {
            const group = this.assetConfig[groupName];
            if (!group) {
                continue;
            }
            for (const [alias, url] of Object.entries(group.images ?? {})) {
                this.assetUrls.set(alias, url);
            }
            for (const [alias, url] of Object.entries(group.json ?? {})) {
                this.assetUrls.set(alias, url);
            }
            if (this.config.soundsEnabled) {
                for (const [alias, url] of Object.entries(group.sounds ?? {})) {
                    this.assetUrls.set(alias, url);
                }
            }
            for (const [alias, spine] of Object.entries(group.spine ?? {})) {
                this.assetUrls.set(`${alias}:json`, spine.json);
                this.assetUrls.set(`${alias}:atlas`, spine.atlas);
            }
        }
    }
    public async loadLoadingAssets(): Promise<void> {
        this.totalAssets = this.getAssetCount("loading") + this.getAssetCount("preLoad");
        this.loadedAssets = 0;
        engine.eventDispatcher.DISPATCH({
            type: "loader",
            name: "start_loading",
            data: {
                loadProgressPercentage: 0
            }
        });

        await this.loadAssets("loading");

        engine.eventDispatcher.DISPATCH({
            type: "loader",
            name: "load_complete",
            data: {
                loadProgressPercentage: 100
            }
        });
    }

    public async loadGameScreenAssets(): Promise<void> {
        await this.loadAssets("preLoad");
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    public async loadPostLoadAssets(): Promise<void> {
        await this.loadAssets("postLoad");
    }

    private async loadAssets(groupName: AssetGroup): Promise<void> {
        console.log(this.assetConfig)
        const group = this.assetConfig[groupName];
        if (!group) {
            return;
        }
        console.log(`Loading assets for group: ${groupName}`, group);
        const assets = this.createAssetList(group);
        if (assets.length === 0) {
            return;
        }
        if (groupName === "preLoad") {
            engine.eventDispatcher.DISPATCH({
                type: "loader",
                name: "pre_loadStart",
                data: {
                    loadProgressPercentage: 0
                }
            });
        }
        if (groupName === "postLoad") {
            engine.eventDispatcher.DISPATCH({
                type: "loader",
                name: "post_loadStart",
                data: {
                    loadProgressPercentage: 0
                }
            });
        }
        for (let i = 0; i < assets.length; i++) {
            await this.loadSingleAsset(assets[i]);
            this.loadedAssets++;
            const groupProgress = Math.round(((i + 1) / assets.length) * 100);
            if (groupName === "loading" || groupName === "preLoad") {
                const percentage = Math.min(
                    100,
                    Math.round((this.loadedAssets / this.totalAssets) * 100)
                );
                engine.eventDispatcher.DISPATCH({
                    type: "loader",
                    name: "continue_progress_load",
                    data: {
                        loadProgressPercentage: percentage
                    }
                });
            }
            if (groupName === "preLoad") {
                engine.eventDispatcher.DISPATCH({
                    type: "loader",
                    name: "pre_loadProgress",
                    data: {
                        loadProgressPercentage: groupProgress
                    }
                });
            }
            if (groupName === "postLoad") {
                engine.eventDispatcher.DISPATCH({
                    type: "loader",
                    name: "post_loadProgress",
                    data: {
                        loadProgressPercentage: groupProgress
                    }
                });
            }
        }
        if (groupName === "loading") {
            this.loadedAssets = this.getAssetCount("loading");
            engine.eventDispatcher.DISPATCH({
                type: "loader",
                name: "continue_progress_load",
                data: {
                    loadProgressPercentage: Math.round(
                        (this.loadedAssets / this.totalAssets) * 100
                    )
                }
            });

            return;
        }

        if (groupName === "preLoad") {
            this.loadedAssets = this.totalAssets;

            engine.eventDispatcher.DISPATCH({
                type: "loader",
                name: "continue_progress_load",
                data: {
                    loadProgressPercentage: 100
                }
            });

            setTimeout(() => {
                engine.eventDispatcher.DISPATCH({
                    type: "loader",
                    name: "pre_loadComplete",
                    data: {
                        loadProgressPercentage: 100
                    }
                });
            }, 1000);

            return;
        }

        if (groupName === "postLoad") {
            engine.eventDispatcher.DISPATCH({
                type: "loader",
                name: "post_loadComplete",
                data: {
                    loadProgressPercentage: 100
                }
            });
        }
    }

    private async loadSingleAsset(asset: AssetDefinition): Promise<void> {
        try {
            await Assets.load({
                alias: asset.alias,
                src: asset.src
            });
        } catch (error) {
            this.handleError({
                alias: asset.alias,
                url: asset.src,
                type: asset.type,
                error
            });
        }
    }

    private createAssetList(group: ManifestGroup): AssetDefinition[] {
        const assets: AssetDefinition[] = [];

        for (const [alias, src] of Object.entries(group.images ?? {})) {
            assets.push({
                alias,
                src,
                type: "image"
            });
        }

        for (const [alias, src] of Object.entries(group.json ?? {})) {
            assets.push({
                alias,
                src,
                type: "json"
            });
        }

        if (this.config.soundsEnabled) {
            for (const [alias, src] of Object.entries(group.sounds ?? {})) {
                assets.push({
                    alias,
                    src,
                    type: "sound"
                });
            }
        }

        for (const [alias, spine] of Object.entries(group.spine ?? {})) {
            if (spine.json) {
                assets.push({
                    alias: `${alias}:json`,
                    src: spine.json,
                    type: "spine-json"
                });
            }

            if (spine.atlas) {
                assets.push({
                    alias: `${alias}:atlas`,
                    src: spine.atlas,
                    type: "spine-atlas"
                });
            }
        }

        return assets;
    }

    private getAssetCount(groupName: AssetGroup): number {
        const group = this.assetConfig[groupName];

        if (!group) {
            return 0;
        }

        let count =
            Object.keys(group.images ?? {}).length +
            Object.keys(group.json ?? {}).length;

        if (this.config.soundsEnabled) {
            count += Object.keys(group.sounds ?? {}).length;
        }

        for (const spine of Object.values(group.spine ?? {})) {
            if (spine.json) {
                count++;
            }

            if (spine.atlas) {
                count++;
            }
        }

        return count;
    }

    private handleError(errorData: AssetError): void {
        this.errors.push(errorData);

        console.error(
            `[AssetLoader] Failed to load: ${errorData.alias}`,
            errorData.url,
            errorData.error
        );

        engine.eventDispatcher.DISPATCH({
            type: "loader",
            name: "asset_load_error",
            data: {
                alias: errorData.alias,
                url: errorData.url,
                assetType: errorData.type,
                error: errorData.error
            }
        });
    }

    public get<T = any>(name: string): T | undefined {
        return Assets.get(name) as T | undefined;
    }

    public getUrl(name: string): string | undefined {
        return this.assetUrls.get(name);
    }

    public getJson<T = any>(name: string): T | undefined {
        return this.jsonFiles[name] as T | undefined;
    }

    public getConfig(): GameConfig {
        return this.config;
    }

    public getManifest(): Manifest {
        return this.assetConfig;
    }

    public has(name: string): boolean {
        return this.assetUrls.has(name);
    }

    public isLoaded(name: string): boolean {
        return Assets.get(name) !== undefined;
    }

    public getErrors(): AssetError[] {
        return [...this.errors];
    }

    public hasErrors(): boolean {
        return this.errors.length > 0;
    }
}