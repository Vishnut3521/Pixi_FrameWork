import { engine } from "../utils/engine";
import { AssetProcessor } from "./assetsProcess";
export class FileUpload {

    constructor() {
        new AssetProcessor();

        engine.eventDispatcher.addCustomListener(
            {
                type: "custom",
                name: "open_file_dialog"
            },
            () => {
                this.openFileDialog();
            }
        );
    }

    private openFileDialog(): void {
        const input = document.createElement("input");

        input.type = "file";
        input.multiple = true;

        input.onchange = () => {
            if (!input.files || input.files.length === 0) {
                return;
            }

            const files = Array.from(input.files);

            this.uploadFiles(files);
        };

        input.click();
    }

    private async uploadFiles(files: File[]): Promise<void> {
        const formData = new FormData();

        files.forEach(file => {
            formData.append("files", file);
        });

        try {
            const response = await fetch("http://localhost:3001/upload", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error("File upload failed.");
            }

            const result = await response.json();

            console.log("Files uploaded successfully:", result);

            engine.eventDispatcher.DISPATCH({
                type: "custom",
                name: "store_complete",
                data: result
            });

        } catch (error) {
            console.error("Upload error:", error);

            engine.eventDispatcher.DISPATCH({
                type: "custom",
                name: "store_error",
                data: {
                    error
                }
            });
        }
    }
}