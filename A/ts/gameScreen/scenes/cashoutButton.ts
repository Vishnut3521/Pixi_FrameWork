import { ButtonGraphic, ButtonColors, GraphicOptions } from "../../gameObjects/textGraphics";


const PLACE_BET_COLORS: ButtonColors = {
  default: 0x28a745,  
  hover: 0x34ce57,   
  pressed: 0x1e7e34,  
  disabled: 0x6c757d, 
};

const CASHOUT_COLORS: ButtonColors = {
  default: 0xff9800,  
  hover: 0xffa726,    
  pressed: 0xf57c00,  
  disabled: 0x6c757d, 
};

export class PlaceBetButton extends ButtonGraphic {
  constructor(name : string ,text: string = "PLACE BET", options: GraphicOptions = {}) {
    super(name , text, options, PLACE_BET_COLORS);
  }


  public setAmount(amount: number, currency: string = "$"): this {
    this.setText(`PLACE BET (${currency}${amount.toFixed(2)})`);
    return this;
  }
}

export class CashoutButton extends ButtonGraphic {
  constructor(name : string ,text: string = "CASHOUT", options: GraphicOptions = {}) {
    super(name , text, options, CASHOUT_COLORS);
  }

  public setCashoutAmount(amount: number, currency: string = "$"): this {
    this.setText(`CASHOUT ${currency}${amount.toFixed(2)}`);
    return this;
  }
}