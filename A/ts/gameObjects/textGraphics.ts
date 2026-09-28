import { Graphic } from "../objects/PixiObjects";
import { Text , Graphics } from "pixi.js"
// Extend options interface if needed
export interface GraphicOptions {
  id?: string;
  name?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

export interface ButtonColors {
  default: number;  // e.g., 0x28a745
  hover: number;    // e.g., 0x34ce57
  pressed: number;  // e.g., 0x1e7e34
  disabled: number; // e.g., 0x6c757d
}

/**
 * Interactive Base Button Class
 * Extends Graphic and adds Hover, Click, Disabled states, and Text handling.
 */
export class ButtonGraphic extends Graphic {
  protected background: Graphics;
  protected textLabel: Text;
  
  protected isDisabled: boolean = false;
  protected isHovered: boolean = false;
  protected isPressed: boolean = false;

  protected btnWidth: number;
  protected btnHeight: number;
  protected colors: ButtonColors;

  constructor(
    name:string,
    text: string, 
    options: GraphicOptions = {}, 
    colors: ButtonColors = { default: 0x4CAF50, hover: 0x66BB6A, pressed: 0x388E3C, disabled: 0x9E9E9E }
  ) {
    super(options);
    this.btnWidth = options.width ?? 160;
    this.btnHeight = options.height ?? 50;
    this.colors = colors;

    // 1. Setup Background
    this.background = new Graphics();
    this.addChild(this.background);

    // 2. Setup Centered Text
    this.textLabel = new Text(text, {
      fill: 0xffffff,
      fontSize: 18,
      fontWeight: 'bold',
      align: 'center',
    });
    this.textLabel.anchor.set(0.5);
    this.textLabel.position.set(this.btnWidth / 2, this.btnHeight / 2);
    this.addChild(this.textLabel);

    // 3. Enable Interaction
    this.eventMode = 'static';
    this.cursor = 'pointer';

    // 4. Bind Interactions
    this.setupEvents();

    // 5. Initial Render
    this.updateVisualState();
  }

  private setupEvents(): void {
    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);
    this.on('pointerdown', this.onPointerDown, this);
    this.on('pointerup', this.onPointerUp, this);
    this.on('pointerupoutside', this.onPointerUp, this);
  }

  // --- Event Handlers ---
  protected onPointerOver(): void {
    if (this.isDisabled) return;
    this.isHovered = true;
    this.updateVisualState();
  }

  protected onPointerOut(): void {
    if (this.isDisabled) return;
    this.isHovered = false;
    this.isPressed = false;
    this.updateVisualState();
  }

  protected onPointerDown(): void {
    if (this.isDisabled) return;
    this.isPressed = true;
    this.updateVisualState();
  }

  protected onPointerUp(): void {
    if (this.isDisabled) return;
    this.isPressed = false;
    this.updateVisualState();
  }

  // --- Visual Redraw ---
  protected updateVisualState(): void {
    this.background.clear();

    let currentColor = this.colors.default;

    if (this.isDisabled) {
      currentColor = this.colors.disabled;
    } else if (this.isPressed) {
      currentColor = this.colors.pressed;
    } else if (this.isHovered) {
      currentColor = this.colors.hover;
    }

    // Draw background rectangle (rounded corners)
    this.background.beginFill(currentColor);
    this.background.drawRoundedRect(0, 0, this.btnWidth, this.btnHeight, 8);
    this.background.endFill();
  }

  // --- Public Methods ---
  public setDisabled(disabled: boolean): this {
    this.isDisabled = disabled;
    this.eventMode = disabled ? 'none' : 'static';
    this.cursor = disabled ? 'default' : 'pointer';
    this.updateVisualState();
    return this;
  }

  public setText(text: string): this {
    this.textLabel.text = text;
    return this;
  }

  public onClick(callback: () => void): this {
    this.on('pointertap', () => {
      if (!this.isDisabled) callback();
    });
    return this;
  }
}