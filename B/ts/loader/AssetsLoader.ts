import { Assets } from "pixi.js";
import assetConfig from "../../assets/json/assets.json";
import { engine } from "../utils/engine";

type AssetGroup = "loading" | "preLoad" | "postLoad";

export class AssetLoader {

    private totalAssets = 0;
    private loadedAssets = 0;

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

    private async loadAssets(groupName: AssetGroup): Promise<void> {

        const group = assetConfig[groupName] as {
            images?: Record<string, string>;
            sounds?: Record<string, string>;
            json?: Record<string, string>;
        };

        const assets = [
            ...Object.entries(group.images ?? {}).map(([alias, src]) => ({ alias, src })),
            ...Object.entries(group.sounds ?? {}).map(([alias, src]) => ({ alias, src })),
            ...Object.entries(group.json ?? {}).map(([alias, src]) => ({ alias, src }))
        ];

        if (assets.length === 0) {
            return;
        }

        const events = {
            preLoad: {
                start: "pre_loadStart",
                progress: "pre_loadProgress",
                finish: "pre_loadComplete"
            },
            postLoad: {
                start: "post_loadStart",
                progress: "post_loadProgress",
                finish: "post_loadComplete"
            }
        } as const;

        if (groupName === "preLoad") {
            engine.eventDispatcher.DISPATCH({
                type: "loader",
                name: "pre_loadStart",
                data: {
                    loadProgressPercentage: 0
                }
            });
        }

        await Assets.load(assets, progress => {

            if (groupName === "loading" || groupName === "preLoad") {

                const groupLoaded = Math.floor(progress * assets.length);

                const previousGroupLoaded = Math.floor(
                    this.loadedAssets % assets.length
                );

                if (groupLoaded > previousGroupLoaded) {
                    this.loadedAssets += groupLoaded - previousGroupLoaded;
                }

                const percentage = Math.min(
                    100,
                    Math.round(
                        (this.loadedAssets / this.totalAssets) * 100
                    )
                );

                // Combined loading progress
                engine.eventDispatcher.DISPATCH({
                    type: "loader",
                    name: "continue_progress_load",
                    data: {
                        loadProgressPercentage: percentage
                    }
                });

                // PRELOAD specific progress
                if (groupName === "preLoad") {
                    engine.eventDispatcher.DISPATCH({
                        type: "loader",
                        name: "pre_loadProgress",
                        data: {
                            loadProgressPercentage: Math.round(progress * 100)
                        }
                    });
                }

                return;
            }

            const event = events[groupName];

            engine.eventDispatcher.DISPATCH({
                type: "loader",
                name: event.progress,
                data: {
                    loadProgressPercentage: Math.round(progress * 100)
                }
            });
        });

        // ==============================
        // AFTER LOADING IS COMPLETE
        // ==============================

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

            // Combined progress = 100%
            engine.eventDispatcher.DISPATCH({
                type: "loader",
                name: "continue_progress_load",
                data: {
                    loadProgressPercentage: 100
                }
            });
            setTimeout(() => {
            // PRELOAD COMPLETE
                engine.eventDispatcher.DISPATCH({
                    type: "loader",
                    name: "pre_loadComplete",
                    data: {
                        loadProgressPercentage: 100
                    }
                });
            }, 1000)

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

    private getAssetCount(groupName: AssetGroup): number {
        const group = assetConfig[groupName] as {
            images?: Record<string, string>;
            sounds?: Record<string, string>;
            json?: Record<string, string>;
        };

        return (
            Object.keys(group.images ?? {}).length +
            Object.keys(group.sounds ?? {}).length +
            Object.keys(group.json ?? {}).length
        );
    }
}