import { Game } from "./main/game";
import { engine } from "./utils/engine";
import { Socket } from "./crash/crash";

export class Main extends Game {
    socket!: Socket;
    isBetPlaced: boolean = false;
    currentMultiplier: number = 0;
    isRoundActive: boolean = false;

    private backgroundMoving: boolean = false;
    private readonly BG_WIDTH = 1920;

    constructor() {
        super();

        window.addEventListener("resize", () => this.handleResize());

        // Splash screen initialization
        engine.eventDispatcher.addCustomListener({ type: "button", name: "splash_button" }, (e: any) => {
            if (e.data?.event === "click" && !this.socket) {
                this.socket = new Socket();
                this.initSocket();
            }
        });

        // Custom UI button click listeners dispatched from GameScreen
        engine.eventDispatcher.addCustomListener({ type: "custom", name: "click_button" }, (e: any) => {
            const btnType = e.data?.button;
            const amount = e.data?.amount ?? 10; // Fallback bet amount

            if (btnType === "placeBet") {
                this.handleBetAction(amount);
            } else if (btnType === "cancelBet") {
                this.handleCancelAction();
            } else if (btnType === "cashout") {
                this.handleCashoutAction();
            }
        });
    }

    private initSocket(): void {
        this.socket.on("connected", (message : any) => {
            console.log("CONNECTED", message.data);
        });

        // TIMER / BETTING PHASE
        this.socket.on("bet_timer", (message : any) => {
            const timer = Number(message.data?.timer ?? 0);
            const object = engine.gameObjects.OBJECTS.multiplierText;

            this.isRoundActive = false;

            // Animate multiplier text into view
            engine.gsap.to(object, {
                x: 0,
                y: -350,
                alpha: 1,
                duration: 0.5,
                ease: "power2.out"
            });

            object.style.fontFamily = "Arial";
            object.setText(`NEXT GAME START IN ${timer}s`);
            object.setGradient([0x0B1F3A, 0x174EA6, 0x6A1B9A]);
            object.setFontSize(64);
            object.scale.set(1);

            // Emit event to update UI buttons state for Betting Phase
            engine.eventDispatcher.DISPATCH({
                type: "custom",
                name: "betting_phase",
                data: { timer, isBetPlaced: this.isBetPlaced }
            });

            // Start entrance transition on last second
            if (timer === 1) {
                this.playTween("start");
            }
        });

        this.socket.on("bet_closed", () => {
            const object = engine.gameObjects.OBJECTS.multiplierText;

            if (this.isBetPlaced) {
                object.setText("BET PLACED");
                object.setGradient([0x003B36, 0x00A896, 0x00D4FF]);
                object.setFontSize(100);
                object.scale.set(1.05);
            } else {
                object.setText("BET CLOSED");
                object.setGradient([0x4A1600, 0xFF6D00, 0xD50000]);
                object.setFontSize(105);
                object.scale.set(1.05);
            }

            // Disable inputs when betting window closes
            engine.eventDispatcher.DISPATCH({
                type: "custom",
                name: "bet_closed",
                data: {}
            });
        });

        this.socket.on("bet_placed", (message : any) => {
            this.isBetPlaced = true;
            engine.eventDispatcher.DISPATCH({
                type: "custom",
                name: "bet_confirmed", 
                data: { betAmount: message.data?.betAmount }
            });
        });

        this.socket.on("bet_rejected", (message : any) => {
            this.isBetPlaced = false;
            const object = engine.gameObjects.OBJECTS.multiplierText;
            object.setText(message.data?.message?.toUpperCase() || "BET REJECTED");
            object.setGradient([0x5C0A00, 0xFF3D00, 0xB71C1C]);
            object.setFontSize(105);
            object.scale.set(1);

            engine.eventDispatcher.DISPATCH({
                type: "custom",
                name: "bet_rejected",
                data: message.data
            });
        });

        // ROUND START / MULTIPLIER PHASE
        this.socket.on("round_start", (message : any) => {
            this.isRoundActive = true;
            this.currentMultiplier = message.data?.multiplier ?? 1.00;

            const object = engine.gameObjects.OBJECTS.multiplierText;
            object.x = 0;
            object.y = -350;
            object.alpha = 1;
            object.style.fontFamily = "Arial";
            object.setText(`x${this.currentMultiplier.toFixed(2)}`);
            object.setGradient([0x064E3B, 0x10B981, 0x84CC16]);
            object.setFontSize(110);
            object.scale.set(1);

            engine.eventDispatcher.DISPATCH({
                type: "custom",
                name: "round_started",
                data: { isBetPlaced: this.isBetPlaced, multiplier: this.currentMultiplier }
            });
        });

        this.socket.on("multiplier_update", (message : any) => {
            this.currentMultiplier = Number(message.data?.multiplier ?? 1);
            const object = engine.gameObjects.OBJECTS.multiplierText;

            object.setText(`x${this.currentMultiplier.toFixed(2)}`);

            // Dynamic color gradients based on multiplier
            if (this.currentMultiplier >= 20) {
                object.setGradient([0x4A044E, 0xD946EF, 0x7C3AED]);
                object.setFontSize(145);
                object.scale.set(1.25);
            } else if (this.currentMultiplier >= 10) {
                object.setGradient([0x7F1D1D, 0xFF3D00, 0xFFD600]);
                object.setFontSize(135);
                object.scale.set(1.20);
            } else if (this.currentMultiplier >= 5) {
                object.setGradient([0x78350F, 0xF59E0B, 0xFDE047]);
                object.setFontSize(125);
                object.scale.set(1.15);
            } else if (this.currentMultiplier >= 2) {
                object.setGradient([0x065F46, 0x10B981, 0xA3E635]);
                object.setFontSize(115);
                object.scale.set(1.08);
            } else {
                object.setGradient([0x064E3B, 0x16A34A, 0x84CC16]);
                object.setFontSize(110);
                object.scale.set(1);
            }
            object.alpha = 1;

            if (this.isBetPlaced && this.isRoundActive) {
                engine.eventDispatcher.DISPATCH({
                    type: "custom",
                    name: "multiplier_change",
                    data: { multiplier: this.currentMultiplier }
                });
            }
        });

        this.socket.on("cashout", (message : any) => {
            this.isBetPlaced = false;
            const object = engine.gameObjects.OBJECTS.multiplierText;
            object.setText(`CASHED OUT x${message.data?.multiplier?.toFixed(2)}`);
            object.setGradient([0x713F12, 0xF59E0B, 0xFDE047]);
            object.setFontSize(100);
            object.scale.set(1.1);

            engine.eventDispatcher.DISPATCH({
                type: "custom",
                name: "cashout_success",
                data: message.data
            });
        });

        this.socket.on("cashout_rejected", (message : any) => {
            console.warn("Cashout failed:", message.data?.message);
        });

        this.socket.on("crash", (message : any) => {
            this.isBetPlaced = false;
            this.isRoundActive = false;

            const object = engine.gameObjects.OBJECTS.multiplierText;
            object.style.fontFamily = "Impact";
            object.setText(`CRASHED @ x${message.data?.crashPoint?.toFixed(2)}`);
            object.setGradient([0xFF0000, 0x8B0000, 0x450A0A]);
            object.setFontSize(120);
            object.scale.set(1.15);

            engine.gsap.killTweensOf(object);
            object.position.set(0, 0);
            object.alpha = 0;

            engine.gsap.to(object, {
                alpha: 1,
                duration: 0.8,
                ease: "power2.inOut"
            });

            this.playTween("end");

            engine.eventDispatcher.DISPATCH({
                type: "custom",
                name: "round_crashed",
                data: message.data
            });
        });

        this.socket.on("error", (message : any) => {
            const object = engine.gameObjects.OBJECTS.multiplierText;
            object.setText("ERROR");
            object.setGradient([0x450A0A, 0xEF4444, 0x991B1B]);
            object.setFontSize(100);
            object.scale.set(1);
        });
    }

    // Direct calls to Socket public API
    private handleBetAction(amount: number = 10): void {
        this.socket?.placeBet(amount);
        engine.eventDispatcher.DISPATCH({ type: "custom", name: "bet_pending", data: {} });
    }

    private handleCancelAction(): void {
        this.isBetPlaced = false;
        engine.eventDispatcher.DISPATCH({ type: "custom", name: "bet_cancelled", data: {} });
    }

    private handleCashoutAction(): void {
        this.socket?.cashout();
    }

    private playTween(mode: "start" | "end"): void {
        const object = engine.gameObjects.OBJECTS.birdSpriteSheet;
        if (!object) return;

        if (mode === "start") {
            object.play?.();
            engine.gsap.killTweensOf(object);

            engine.gsap.fromTo(
                object,
                { x: -(1920 / 2) - 100, y: 0 },
                {
                    x: 0,
                    y: 0,
                    duration: 1,
                    ease: "power2.in",
                    onComplete: () => this.moveBackground(true)
                }
            );

            engine.gsap.fromTo(
                object.scale,
                { x: 1, y: 1 },
                { x: 2.5, y: 2.5, duration: 1, ease: "power2.in" }
            );
        } else if (mode === "end") {
            this.moveBackground(false);

            engine.gsap.killTweensOf(object);
            engine.gsap.fromTo(
                object,
                { x: object.x, y: object.y },
                { x: 1920 / 2 + 100, y: -200, duration: 1, ease: "power2.out" }
            );

            engine.gsap.fromTo(
                object.scale,
                { x: object.scale.x, y: object.scale.y },
                {
                    x: 1,
                    y: 1,
                    duration: 1,
                    ease: "power2.out"
                }
            );
        }
    }

    private moveBackground(start: boolean): void {
        if (start) {
            if (this.backgroundMoving) return;
            this.backgroundMoving = true;
            this.resetBackgroundPositions();
            engine.app.ticker.add(this.backgroundLoop);
        } else {
            this.backgroundMoving = false;
            engine.app.ticker.remove(this.backgroundLoop);
        }
    }

    private resetBackgroundPositions(): void {
        const bg1 = engine.gameObjects.OBJECTS.backgound1;
        const bg2 = engine.gameObjects.OBJECTS.background2;
        if (!bg1 || !bg2) return;
        bg1.x = 0;
        bg2.x = bg1.width || this.BG_WIDTH;
    }

    private backgroundLoop = (): void => {
        const bg1 = engine.gameObjects.OBJECTS.backgound1;
        const bg2 = engine.gameObjects.OBJECTS.background2;
        if (!bg1 || !bg2) return;

        const width = bg1.width || this.BG_WIDTH;
        const speed = 4;

        bg1.x -= speed;
        bg2.x -= speed;

        if (bg1.x <= -width) {
            bg1.x = bg2.x + width;
        }
        if (bg2.x <= -width) {
            bg2.x = bg1.x + width;
        }
    };

    private handleResize(): void {
        const bg1 = engine.gameObjects.OBJECTS.backgound1;
        const bg2 = engine.gameObjects.OBJECTS.background2;

        if (!bg1 || !bg2) return;

        const width = bg1.width || this.BG_WIDTH;

        if (bg1.x < bg2.x) {
            bg2.x = bg1.x + width;
        } else {
            bg1.x = bg2.x + width;
        }
    }
}

new Main();