import { engine } from "../utils/engine";

interface UploadedFile {
    name: string;
    path: string;
    size: number;
}

interface AssetData {
    skeleton?: UploadedFile;
    atlas?: UploadedFile;
    textures: UploadedFile[];
}

export class AssetProcessor {

    constructor() {
        engine.eventDispatcher.addCustomListener(
            {
                type: "custom",
                name: "store_complete"
            },
            event => {
                this.process(event.data.files);
            }
        );
    }

    private process(files: UploadedFile[]): void {
        const assetData: AssetData = {
            textures: []
        };

        files.forEach(file => {
            const extension = this.getExtension(file.name);

            if (extension === ".json" || extension === ".skel") {
                assetData.skeleton = file;
                return;
            }

            if (extension === ".atlas") {
                assetData.atlas = file;
                return;
            }

            if (
                extension === ".png" ||
                extension === ".jpg" ||
                extension === ".jpeg" ||
                extension === ".webp"
            ) {
                assetData.textures.push(file);
            }
        });

        console.log("Asset processing complete:", assetData);

        engine.eventDispatcher.DISPATCH({
            type: "custom",
            name: "asset_process_complete",
            data: assetData
        });
    }

    private getExtension(fileName: string): string {
        const index = fileName.lastIndexOf(".");

        if (index === -1) {
            return "";
        }

        return fileName.substring(index).toLowerCase();
    }
}