export type CrashMessageType =
    | "connected"
    | "bet_timer"
    | "bet_placed"
    | "bet_rejected"
    | "bet_closed"
    | "round_start"
    | "multiplier_update"
    | "cashout"
    | "cashout_rejected"
    | "win"
    | "crash"
    | "round_end"
    | "error";

export interface CrashMessage {
    type: CrashMessageType;
    data?: {
        timer?: number;
        multiplier?: number;
        crashPoint?: number;
        betAmount?: number;
        winAmount?: number;
        profit?: number;
        roundId?: number;
        errorCode?: string;
        message?: string;
    };
}

export type SocketCallback = (message: CrashMessage) => void;

interface MultiplierRange {
    start: number;
    end: number;
    duration: number;
}

interface BetData {
    amount: number;
    placed: boolean;
    cashedOut: boolean;
    cashoutMultiplier: number;
    winAmount: number;
}

export class Socket {
    public listeners: Map<CrashMessageType, SocketCallback[]> = new Map();

    public bettingTimer: ReturnType<typeof setInterval> | null = null;
    public multiplierTimer: ReturnType<typeof setInterval> | null = null;
    public crashWaitTimer: ReturnType<typeof setTimeout> | null = null;
    public roundStartWaitTimer: ReturnType<typeof setTimeout> | null = null;

    public readonly BETTING_TIME = 5;
    public readonly WAIT_TIME = 3000;
    public readonly UPDATE_INTERVAL = 16;

    public roundId = 0;
    public multiplier = 1;
    public crashPoint = 1;

    public isBetting = false;
    public isRunning = false;
    public isWaiting = false;

    public betData: BetData = {
        amount: 0,
        placed: false,
        cashedOut: false,
        cashoutMultiplier: 0,
        winAmount: 0
    };

    public readonly multiplierRanges: MultiplierRange[] = [
        { start: 1, end: 2, duration: 3000 },
        { start: 2, end: 5, duration: 3000 },
        { start: 5, end: 20, duration: 3000 },
        { start: 20, end: 100, duration: 3000 },
        { start: 100, end: 500, duration: 5000 },
        { start: 500, end: 5000, duration: 10000 }
    ];

    constructor() {
        this.connect();
    }

    public connect(): void {
        this.emit({
            type: "connected",
            data: { message: "Socket connected" }
        });

        this.startCrashWait();
    }

    public on(type: CrashMessageType, callback: SocketCallback): void {
        const callbacks = this.listeners.get(type) || [];
        callbacks.push(callback);
        this.listeners.set(type, callbacks);
    }

    public off(type: CrashMessageType, callback: SocketCallback): void {
        const callbacks = this.listeners.get(type);
        if (!callbacks) return;

        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }

        if (callbacks.length === 0) {
            this.listeners.delete(type);
        }
    }

    public emit(message: CrashMessage): void {
        const callbacks = this.listeners.get(message.type);
        if (!callbacks) return;

        callbacks.forEach((callback) => callback(message));
    }

    public placeBet(amount: number): void {
        if (!this.isBetting) {
            this.emit({
                type: "bet_rejected",
                data: {
                    errorCode: "BETTING_CLOSED",
                    message: "Betting is not open"
                }
            });
            return;
        }

        if (this.betData.placed) {
            this.emit({
                type: "bet_rejected",
                data: {
                    errorCode: "BET_ALREADY_PLACED",
                    message: "Bet already placed"
                }
            });
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            this.emit({
                type: "bet_rejected",
                data: {
                    errorCode: "INVALID_AMOUNT",
                    message: "Invalid bet amount"
                }
            });
            return;
        }

        this.betData.amount = amount;
        this.betData.placed = true;
        this.betData.cashedOut = false;
        this.betData.cashoutMultiplier = 0;
        this.betData.winAmount = 0;

        this.emit({
            type: "bet_placed",
            data: {
                betAmount: amount,
                roundId: this.roundId,
                message: "Bet placed successfully"
            }
        });
    }

    public cashout(): void {
        if (!this.isRunning) {
            this.emit({
                type: "cashout_rejected",
                data: {
                    errorCode: "ROUND_NOT_RUNNING",
                    message: "Round is not running"
                }
            });
            return;
        }

        if (!this.betData.placed) {
            this.emit({
                type: "cashout_rejected",
                data: {
                    errorCode: "NO_BET",
                    message: "No active bet"
                }
            });
            return;
        }

        if (this.betData.cashedOut) {
            this.emit({
                type: "cashout_rejected",
                data: {
                    errorCode: "ALREADY_CASHED_OUT",
                    message: "Bet already cashed out"
                }
            });
            return;
        }

        const cashoutMultiplier = this.multiplier;
        const winAmount = this.betData.amount * cashoutMultiplier;
        const profit = winAmount - this.betData.amount;

        this.betData.cashedOut = true;
        this.betData.cashoutMultiplier = cashoutMultiplier;
        this.betData.winAmount = winAmount;

        this.emit({
            type: "cashout",
            data: {
                multiplier: cashoutMultiplier,
                betAmount: this.betData.amount,
                winAmount,
                profit,
                roundId: this.roundId,
                message: "Cashout successful"
            }
        });
    }

    public startCrashWait(): void {
        this.stopCrashWaitTimer();
        this.stopRoundStartWaitTimer();
        this.stopBettingTimer();
        this.stopMultiplierTimer();

        this.isWaiting = true;
        this.isBetting = false;
        this.isRunning = false;

        this.crashWaitTimer = setTimeout(() => {
            this.crashWaitTimer = null;
            this.isWaiting = false;
            this.startBettingPhase();
        }, this.WAIT_TIME);
    }

    public startBettingPhase(): void {
        this.stopBettingTimer();

        this.isWaiting = false;
        this.isBetting = true;
        this.isRunning = false;

        this.roundId++;
        this.multiplier = 1;

        this.betData = {
            amount: 0,
            placed: false,
            cashedOut: false,
            cashoutMultiplier: 0,
            winAmount: 0
        };

        let timer = this.BETTING_TIME;

        this.emit({
            type: "bet_timer",
            data: {
                timer,
                roundId: this.roundId,
                message: "Betting started"
            }
        });

        this.bettingTimer = setInterval(() => {
            timer--;

            if (timer > 0) {
                this.emit({
                    type: "bet_timer",
                    data: {
                        timer,
                        roundId: this.roundId
                    }
                });
                return;
            }

            this.stopBettingTimer();
            this.isBetting = false;

            this.emit({
                type: "bet_closed",
                data: {
                    betAmount: this.betData.placed ? this.betData.amount : 0,
                    roundId: this.roundId,
                    message: this.betData.placed ? "Betting closed" : "No bet placed"
                }
            });

            this.startRoundStartWait();
        }, 1000);
    }

    public startRoundStartWait(): void {
        this.stopRoundStartWaitTimer();

        this.isWaiting = true;
        this.isBetting = false;
        this.isRunning = false;

        this.roundStartWaitTimer = setTimeout(() => {
            this.roundStartWaitTimer = null;
            this.isWaiting = false;
            this.startRound();
        }, this.WAIT_TIME);
    }

    public startRound(): void {
        this.stopMultiplierTimer();

        this.isWaiting = false;
        this.isBetting = false;
        this.isRunning = true;

        this.multiplier = 1;
        this.crashPoint = this.generateCrashPoint();

        const startTime = Date.now();

        this.emit({
            type: "round_start",
            data: {
                multiplier: this.multiplier,
                crashPoint: this.crashPoint,
                roundId: this.roundId,
                message: "Round started"
            }
        });

        this.multiplierTimer = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            this.multiplier = this.calculateMultiplier(elapsedTime);

            if (this.multiplier >= this.crashPoint) {
                this.multiplier = this.crashPoint;

                this.emit({
                    type: "multiplier_update",
                    data: {
                        multiplier: this.multiplier,
                        roundId: this.roundId
                    }
                });

                this.crashRound();
                return;
            }

            this.emit({
                type: "multiplier_update",
                data: {
                    multiplier: this.multiplier,
                    roundId: this.roundId
                }
            });
        }, this.UPDATE_INTERVAL);
    }

    public crashRound(): void {
        if (!this.isRunning) return;

        this.stopMultiplierTimer();

        this.isRunning = false;
        this.isBetting = false;
        this.isWaiting = false;

        this.emit({
            type: "crash",
            data: {
                multiplier: this.multiplier,
                crashPoint: this.crashPoint,
                roundId: this.roundId,
                message: "Round crashed"
            }
        });

        this.emit({
            type: "round_end",
            data: {
                multiplier: this.multiplier,
                crashPoint: this.crashPoint,
                roundId: this.roundId,
                message: "Round ended"
            }
        });

        this.startCrashWait();
    }

    public generateCrashPoint(): number {
        const random = Math.random();
        if (random === 0) return 1;

        const crashPoint = 0.96 / (1 - random);
        return Math.max(1, Number(crashPoint.toFixed(2)));
    }

    public calculateMultiplier(elapsedTime: number): number {
        let accumulatedTime = 0;

        for (const range of this.multiplierRanges) {
            const rangeEndTime = accumulatedTime + range.duration;

            if (elapsedTime <= rangeEndTime) {
                const rangeElapsed = elapsedTime - accumulatedTime;
                const progress = rangeElapsed / range.duration;
                const value = range.start + (range.end - range.start) * progress;

                return Number(value.toFixed(2));
            }

            accumulatedTime = rangeEndTime;
        }

        return this.multiplierRanges[this.multiplierRanges.length - 1].end;
    }

    public stopBettingTimer(): void {
        if (this.bettingTimer !== null) {
            clearInterval(this.bettingTimer);
            this.bettingTimer = null;
        }
    }

    public stopMultiplierTimer(): void {
        if (this.multiplierTimer !== null) {
            clearInterval(this.multiplierTimer);
            this.multiplierTimer = null;
        }
    }

    public stopCrashWaitTimer(): void {
        if (this.crashWaitTimer !== null) {
            clearTimeout(this.crashWaitTimer);
            this.crashWaitTimer = null;
        }
    }

    public stopRoundStartWaitTimer(): void {
        if (this.roundStartWaitTimer !== null) {
            clearTimeout(this.roundStartWaitTimer);
            this.roundStartWaitTimer = null;
        }
    }

    public getMultiplier(): number { return this.multiplier; }
    public getCrashPoint(): number { return this.crashPoint; }
    public getRoundId(): number { return this.roundId; }
    public getBetData(): BetData { return { ...this.betData }; }
    public getState() {
        return {
            isWaiting: this.isWaiting,
            isBetting: this.isBetting,
            isRunning: this.isRunning
        };
    }

    public destroy(): void {
        this.stopBettingTimer();
        this.stopMultiplierTimer();
        this.stopCrashWaitTimer();
        this.stopRoundStartWaitTimer();
        this.listeners.clear();

        this.isBetting = false;
        this.isRunning = false;
        this.isWaiting = false;
    }
}


const socket = new Socket();

// List of all supported message types
const messageTypes: CrashMessageType[] = [
    "connected",
    "bet_timer",
    "bet_placed",
    "bet_rejected",
    "bet_closed",
    "round_start",
    "multiplier_update",
    "cashout",
    "cashout_rejected",
    "win",
    "crash",
    "round_end",
    "error"
];

// Helper to format timestamps
const getTimestamp = () => new Date().toLocaleTimeString();

// Attach a logger for every message type
messageTypes.forEach((type) => {
    socket.on(type, (message: CrashMessage) => {
        const time = getTimestamp();
        const { data } = message;

        switch (type) {
            case "connected":
                console.log(`[${time}] 🟢 CONNECTED | ${data?.message}`);
                break;

            case "bet_timer":
                console.log(`[${time}] ⏳ BETTING TIMER | Round #${data?.roundId} - Time left: ${data?.timer}s`);
                break;

            case "bet_placed":
                console.log(`[${time}] ✅ BET PLACED | Round #${data?.roundId} - Amount: $${data?.betAmount}`);
                break;

            case "bet_rejected":
                console.warn(`[${time}] ❌ BET REJECTED | Code: ${data?.errorCode} - ${data?.message}`);
                break;

            case "bet_closed":
                console.log(`[${time}] 🔒 BETTING CLOSED | Round #${data?.roundId} - Active Bet: $${data?.betAmount}`);
                break;

            case "round_start":
                console.log(`[${time}] 🚀 ROUND START | Round #${data?.roundId} - Target Crash Point: ${data?.crashPoint}x`);
                break;

            case "multiplier_update":
                // Optional: Reduce clutter by logging only on integer jumps or decimal thresholds if needed
                console.log(`[${time}] 📈 MULTIPLIER | Round #${data?.roundId} -> ${data?.multiplier?.toFixed(2)}x`);
                break;

            case "cashout":
                console.log(`[${time}] 💰 CASHOUT SUCCESS | Round #${data?.roundId} - Multiplier: ${data?.multiplier}x | Won: $${data?.winAmount} (Profit: $${data?.profit})`);
                break;

            case "cashout_rejected":
                console.warn(`[${time}] ⚠️ CASHOUT REJECTED | Code: ${data?.errorCode} - ${data?.message}`);
                break;

            case "crash":
                console.log(`[${time}] 💥 CRASHED! | Round #${data?.roundId} crashed at ${data?.crashPoint}x`);
                break;

            case "round_end":
                console.log(`[${time}] 🏁 ROUND END | Round #${data?.roundId} finished.`);
                console.log("--------------------------------------------------");
                break;

            case "error":
                console.error(`[${time}] 🚨 ERROR | Code: ${data?.errorCode} - ${data?.message}`);
                break;

            default:
                console.log(`[${time}] 📩 MESSAGE [${type}]`, data);
        }
    });
});