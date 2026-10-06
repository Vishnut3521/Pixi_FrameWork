import { Application } from "pixi.js";
import { GameObject } from "./GameObject";
import { engine } from "../utils/engine";

export class GameApplication {
    public readonly app: Application;
    private gameObject!: GameObject;
    private resizeAnimationFrame: number | null = null;

    private readonly LANDSCAPE_WIDTH = 1920;
    private readonly LANDSCAPE_HEIGHT = 1080;
    private readonly PORTRAIT_WIDTH = 1080;
    private readonly PORTRAIT_HEIGHT = 1920;

    constructor() {
        this.app = new Application();
        engine.app = this.app
    }

    public async init(): Promise<void> {
        await this.app.init({ width: this.LANDSCAPE_WIDTH, height: this.LANDSCAPE_HEIGHT, background: "#000000", antialias: true, resolution: window.devicePixelRatio || 1, autoDensity: true });
        (window as any).__PIXI_APP__ = this.app;
        this.setupPage();
        document.body.appendChild(this.app.canvas);
        this.gameObject = new GameObject(this.LANDSCAPE_WIDTH, this.LANDSCAPE_HEIGHT);
        this.app.stage.addChild(this.gameObject);
        this.resize(()=>{});
    }

    private setupPage(): void {
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100vw";
        document.body.style.height = "100vh";
        document.body.style.display = "flex";
        document.body.style.justifyContent = "center";
        document.body.style.alignItems = "center";
        document.body.style.backgroundColor = "#000000";
    }

    private getDesignSize(): { width: number; height: number } {
        const { deviceOrientation } = engine.gameResizer.data;

        switch (deviceOrientation) {
            case "mobile_portrait": return { width: this.PORTRAIT_WIDTH, height: this.PORTRAIT_HEIGHT };
            case "mobile_landscape": return { width: this.LANDSCAPE_WIDTH, height: this.LANDSCAPE_HEIGHT };
            case "ipad_portrait":
            case "ipad_landscape":
            case "android_tablet_portrait":
            case "android_tablet_landscape":
            case "windows_tablet_portrait":
            case "windows_tablet_landscape":
            case "desktop_landscape":
            default: return { width: this.LANDSCAPE_WIDTH, height: this.LANDSCAPE_HEIGHT };
        }
    }

    public resize(callback : () => void): void {
        if (this.resizeAnimationFrame !== null) cancelAnimationFrame(this.resizeAnimationFrame);

        this.resizeAnimationFrame = requestAnimationFrame(() => {
            this.resizeAnimationFrame = null;
            engine.gameResizer.update(window.innerWidth, window.innerHeight);

            const data = engine.gameResizer.data;
            const design = this.getDesignSize();
            const scale = Math.min(data.innerWidth / design.width, data.innerHeight / design.height);

            this.app.renderer.resize(design.width, design.height);
            this.app.canvas.style.width = `${design.width * scale}px`;
            this.app.canvas.style.height = `${design.height * scale}px`;
            this.gameObject.resize(design.width, design.height);
            setTimeout(() => {
                callback()
            }, 0);
        });
    }
}
