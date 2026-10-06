import { engine } from "./engine";
export type DeviceType =
    | "desktop"
    | "mobile"
    | "tablet"
    | "ipad"
    | "android_tablet"
    | "windows_tablet";

export type OrientationType = "landscape" | "portrait";

export type DeviceOrientationType =
    | "desktop_landscape"
    | "mobile_landscape"
    | "mobile_portrait"
    | "ipad_landscape"
    | "ipad_portrait"
    | "android_tablet_landscape"
    | "android_tablet_portrait"
    | "windows_tablet_landscape"
    | "windows_tablet_portrait";

export interface GameResizeData {
    windowWidth: number;
    windowHeight: number;
    innerWidth: number;
    innerHeight: number;
    screenWidth: number;
    screenHeight: number;
    canvasWidth: number;
    canvasHeight: number;
    device: DeviceType;
    deviceName: string;
    orientation: OrientationType;
    deviceOrientation: DeviceOrientationType;
    aspectRatio: number;
    ratioName: string;
    screenAspectRatio: number;
    screenRatioName: string;
    scale: number;
    userAgent: string;
    platform: string;
}

export class GameResizer {
    public readonly data: GameResizeData = {
        windowWidth: 0,
        windowHeight: 0,
        innerWidth: 0,
        innerHeight: 0,
        screenWidth: 0,
        screenHeight: 0,
        canvasWidth: 0,
        canvasHeight: 0,
        device: "desktop",
        deviceName: "Desktop",
        orientation: "landscape",
        deviceOrientation: "desktop_landscape",
        aspectRatio: 0,
        ratioName: "",
        screenAspectRatio: 0,
        screenRatioName: "",
        scale: 1,
        userAgent: "",
        platform: ""
    };

    public update(canvasWidth: number, canvasHeight: number): void {
        const innerWidth = window.innerWidth;
        const innerHeight = window.innerHeight;
        const windowWidth = innerWidth;
        const windowHeight = innerHeight;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const deviceInfo = this.detectDevice();
        const orientation: OrientationType = deviceInfo.device === "desktop" ? "landscape" : innerWidth >= innerHeight ? "landscape" : "portrait";
        const aspectRatio = innerWidth / innerHeight;
        const screenAspectRatio = screenWidth / screenHeight;
        const scale = Math.min(innerWidth / canvasWidth, innerHeight / canvasHeight);
        const deviceOrientation = this.getDeviceOrientation(deviceInfo.device, orientation);

        Object.assign(this.data, {
            windowWidth,
            windowHeight,
            innerWidth,
            innerHeight,
            screenWidth,
            screenHeight,
            canvasWidth,
            canvasHeight,
            device: deviceInfo.device,
            deviceName: deviceInfo.deviceName,
            orientation,
            deviceOrientation,
            aspectRatio,
            ratioName: this.getClosestRatio(aspectRatio),
            screenAspectRatio,
            screenRatioName: this.getClosestRatio(screenAspectRatio),
            scale,
            userAgent: navigator.userAgent,
            platform: this.getPlatform()
        });
        engine.eventDispatcher.DISPATCH({ type: "game", name: "resize" ,data: this.data });
    }

    private detectDevice(): { device: DeviceType; deviceName: string } {
        const ua = navigator.userAgent.toLowerCase();
        const platform = this.getPlatform().toLowerCase();
        const isIPad = /ipad/.test(ua) || (/macintosh/.test(ua) && navigator.maxTouchPoints > 1);

        if (isIPad) return { device: "ipad", deviceName: "iPad" };

        if (/android/.test(ua)) {
            if (/mobile/.test(ua)) return { device: "mobile", deviceName: this.getAndroidDeviceName(ua) };
            return { device: "android_tablet", deviceName: this.getAndroidDeviceName(ua) };
        }

        if (/iphone|ipod/.test(ua)) return { device: "mobile", deviceName: /iphone/.test(ua) ? "iPhone" : "iPod" };

        if (/windows/.test(ua) || /win32|win64/.test(platform)) {
            const isWindowsTablet = navigator.maxTouchPoints > 0 && (/touch/.test(ua) || /tablet/.test(ua));
            if (isWindowsTablet) return { device: "windows_tablet", deviceName: "Windows Tablet" };
            return { device: "desktop", deviceName: "Windows Desktop" };
        }

        if (/mobile|phone|blackberry|iemobile|opera mini/.test(ua)) return { device: "mobile", deviceName: "Mobile" };

        if (/tablet|kindle|silk|playbook/.test(ua)) return { device: "tablet", deviceName: "Tablet" };

        return { device: "desktop", deviceName: this.getDesktopDeviceName(ua) };
    }

    private getDeviceOrientation(device: DeviceType, orientation: OrientationType): DeviceOrientationType {
        if (device === "desktop") return "desktop_landscape";

        switch (device) {
            case "mobile":
                return orientation === "landscape" ? "mobile_landscape" : "mobile_portrait";
            case "ipad":
                return orientation === "landscape" ? "ipad_landscape" : "ipad_portrait";
            case "android_tablet":
                return orientation === "landscape" ? "android_tablet_landscape" : "android_tablet_portrait";
            case "windows_tablet":
                return orientation === "landscape" ? "windows_tablet_landscape" : "windows_tablet_portrait";
            default:
                return "desktop_landscape";
        }
    }

    private getAndroidDeviceName(userAgent: string): string {
        const match = userAgent.match(/android[^;]*;\s*([^;)]+)/);
        return match?.[1]?.trim() || "Android Device";
    }

    private getDesktopDeviceName(userAgent: string): string {
        if (/macintosh|mac os x/.test(userAgent)) return "Mac Desktop";
        if (/linux/.test(userAgent)) return "Linux Desktop";
        if (/cros/.test(userAgent)) return "ChromeOS";
        return "Desktop";
    }

    private getPlatform(): string {
        const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
        return nav.userAgentData?.platform || navigator.platform || "";
    }

    private getClosestRatio(ratio: number): string {
        const ratios = [
            { name: "16:9", value: 16 / 9 },
            { name: "16:10", value: 16 / 10 },
            { name: "4:3", value: 4 / 3 },
            { name: "3:2", value: 3 / 2 },
            { name: "5:4", value: 5 / 4 },
            { name: "21:9", value: 21 / 9 },
            { name: "32:9", value: 32 / 9 },
            { name: "3:4", value: 3 / 4 },
            { name: "2:3", value: 2 / 3 },
            { name: "9:16", value: 9 / 16 },
            { name: "1:1", value: 1 }
        ];

        let closest = ratios[0];
        let difference = Math.abs(ratio - closest.value);

        for (const item of ratios) {
            const currentDifference = Math.abs(ratio - item.value);
            if (currentDifference < difference) {
                difference = currentDifference;
                closest = item;
            }
        }

        return closest.name;
    }

    public getScreenOrientation(): OrientationType {
        if (this.data.device === "desktop") return "landscape";

        if (window.screen.orientation?.type) return window.screen.orientation.type.includes("landscape") ? "landscape" : "portrait";

        return window.innerWidth >= window.innerHeight ? "landscape" : "portrait";
    }

    public getDebugData(): GameResizeData {
        return { ...this.data };
    }
}
