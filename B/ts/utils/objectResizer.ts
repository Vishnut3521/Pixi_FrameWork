import { engine } from "./engine";
import loadingConfig from "../../assets/json/resposive/loadingConfig.json";

export class ObjectResizer {

    private readonly DEFAULTS = {
        position: {
            x: 0,
            y: 0
        },
        scale: {
            x: 1,
            y: 1
        },
        visible: true,
        alpha: 1
    };

    private config = loadingConfig;

    public update(objectName: string): void {
        const object = engine.gameObjects.OBJECTS[objectName];
        if (!object) {
            return;
        }
        const config = (this.config as Record<string, any>)[objectName];
        if (!config) {
            this.applyDefaults(object);
            return;
        }

        const device = engine.gameResizer.data.device;
        const orientation = engine.gameResizer.data.orientation;

        console.log(device)
        console.log(orientation)

        const position = this.getProperty(
            config.position,
            device,
            orientation,
            this.DEFAULTS.position
        );

        const scale = this.getProperty(
            config.scale,
            device,
            orientation,
            this.DEFAULTS.scale
        );

        const visible = this.getProperty(
            config.visible,
            device,
            orientation,
            this.DEFAULTS.visible
        );

        const alpha = this.getProperty(
            config.alpha,
            device,
            orientation,
            this.DEFAULTS.alpha
        );

        object.position.set(
            position.x,
            position.y
        );

        object.scale.set(
            scale.x,
            scale.y
        );

        object.setVisible(visible);
        console.warn(object , visible)
        object.setAlpha(alpha);
    }

    private getProperty(
        propertyConfig: any,
        device: string,
        orientation: string,
        defaultValue: any
    ): any {
        if (propertyConfig === undefined) {
            return defaultValue;
        }

        let deviceConfig = propertyConfig[device];

        if (deviceConfig === undefined) {
            deviceConfig = propertyConfig.default;
        }

        if (deviceConfig === undefined) {
            deviceConfig = propertyConfig.desktop;
        }

        if (deviceConfig === undefined) {
            deviceConfig = propertyConfig.ipad;
        }

        if (deviceConfig === undefined) {
            deviceConfig = propertyConfig.mobile;
        }

        if (deviceConfig === undefined) {
            return defaultValue;
        }


        let orientationConfig = deviceConfig[orientation];

        if (orientationConfig === undefined) {
            orientationConfig = deviceConfig.landscape;
        }

        if (orientationConfig === undefined) {
            orientationConfig = deviceConfig.portrait;
        }

        if (orientationConfig === undefined) {
            return defaultValue;
        }
        if (
            typeof defaultValue === "object" &&
            typeof orientationConfig === "object"
        ) {
            return {
                ...defaultValue,
                ...orientationConfig
            };
        }
        return orientationConfig;
    }

    private applyDefaults(object: any): void {
        object.position.set(
            this.DEFAULTS.position.x,
            this.DEFAULTS.position.y
        );

        object.scale.set(
            this.DEFAULTS.scale.x,
            this.DEFAULTS.scale.y
        );

        object.setVisible(this.DEFAULTS.visible);
        object.setAlpha(this.DEFAULTS.alpha);
    }
}
