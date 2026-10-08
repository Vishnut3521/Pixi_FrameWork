import { GameContainer } from "../main/gameContainer";
import { Graphic, GameText } from "../objects/PixiObjects";
import { BrowseButton } from "./scenes/browseButton";
export class GameScreen extends GameContainer {

    private background!: Graphic;
    private panel!: Graphic;
    private dropArea!: Graphic;
    private browseButton!: Graphic;

    private title!: GameText;
    private description!: GameText;
    private dropIcon!: GameText;
    private dropText!: GameText;
    private dropSubText!: GameText;
    private dropHint!: GameText;
    private browseText!: GameText;
    private supportedText!: GameText;

    constructor() {
        super(1920, 1080);

        this.createUploadUI();

        this.resize();
    }

    private createUploadUI(): void {

        // Outer background

        this.background = new Graphic({
            name: "viewerBackground"
        });

        this.background.setSize(1920, 1080);
        this.background.setPosition(0, 0);


        // Main container

        this.panel = new Graphic({
            name: "uploadPanel"
        });

        this.panel.setSize(900, 700);
        this.panel.setPosition(0, 0);
        this.panel.setBackground(0x14283D, 1, 32);
        this.panel.setBorder(0x315A70, 2, 1, 32);


        // Title

        this.title = new GameText({
            name: "uploadTitle",
            stage: "SPINE VIEWER"
        });

        this.title.setStyle({
            fontFamily: "Trebuchet MS",
            fontSize: 46,
            fontWeight: "700",
            letterSpacing: 4
        });

        this.title.setGradient([
            0x67E8F9,
            0x38BDF8,
            0x818CF8
        ]);

        this.title.setPosition(0, -275);


        // Description

        this.description = new GameText({
            name: "uploadDescription",
            stage: "Bring your Spine characters to life"
        });

        this.description.setStyle({
            fontFamily: "Trebuchet MS",
            fontSize: 19,
            fontWeight: "400",
            fill: 0xB5C9D9,
            letterSpacing: 0.5
        });

        this.description.setPosition(0, -220);


        // Drop area

        this.dropArea = new Graphic({
            name: "dropArea"
        });

        this.dropArea.setSize(650, 350);
        this.dropArea.setPosition(0, -5);
        this.dropArea.setBackground(0x19364A, 1, 24);
        this.dropArea.setBorder(0x3C8BA5, 2, 1, 24);


        // Upload icon

        this.dropIcon = new GameText({
            name: "dropIcon",
            stage: "↑"
        });

        this.dropIcon.setStyle({
            fontFamily: "Arial",
            fontSize: 56,
            fontWeight: "700"
        });

        this.dropIcon.setGradient([
            0x22D3EE,
            0x38BDF8,
            0x818CF8
        ]);

        this.dropIcon.setPosition(0, -105);


        // Drop title

        this.dropText = new GameText({
            name: "dropText",
            stage: "DROP YOUR SPINE PROJECT"
        });

        this.dropText.setStyle({
            fontFamily: "Trebuchet MS",
            fontSize: 22,
            fontWeight: "700",
            fill: 0xFFFFFF,
            letterSpacing: 1
        });

        this.dropText.setPosition(0, -30);


        // Drop description

        this.dropSubText = new GameText({
            name: "dropSubText",
            stage: "Drag & drop your files here"
        });

        this.dropSubText.setStyle({
            fontFamily: "Trebuchet MS",
            fontSize: 16,
            fontWeight: "400",
            fill: 0xA7BDCC
        });

        this.dropSubText.setPosition(0, 8);


        // File types

        this.dropHint = new GameText({
            name: "dropHint",
            stage: "JSON  •  SKEL  •  ATLAS  •  PNG  •  JPG  •  WEBP"
        });

        this.dropHint.setStyle({
            fontFamily: "Trebuchet MS",
            fontSize: 13,
            fontWeight: "500",
            fill: 0x7193A4,
            letterSpacing: 0.8
        });

        this.dropHint.setPosition(0, 42);


        // Browse button

        this.browseButton = new BrowseButton({
            name: "browseButton"
        });

        this.browseButton.setSize(260, 58);
        this.browseButton.setPosition(0, 120);
        this.browseButton.setBackground(0x168AAD, 1, 16);
        this.browseButton.setBorder(0x42C6E8, 2, 1, 16);


        // Browse button text

        this.browseText = new GameText({
            name: "browseText",
            stage: "＋  BROWSE FILES"
        });

        this.browseText.setStyle({
            fontFamily: "Trebuchet MS",
            fontSize: 17,
            fontWeight: "700",
            fill: 0xFFFFFF,
            letterSpacing: 0.8
        });

        this.browseText.setPosition(0, 120);


        // Bottom text

        this.supportedText = new GameText({
            name: "supportedText",
            stage: "Select your Spine skeleton, atlas and texture files"
        });

        this.supportedText.setStyle({
            fontFamily: "Trebuchet MS",
            fontSize: 14,
            fontWeight: "400",
            fill: 0x7190A1
        });

        this.supportedText.setPosition(0, 210);


        // Add objects

        this.addChild(
            this.background,
            this.panel,
            this.title,
            this.description,
            this.dropArea,
            this.dropIcon,
            this.dropText,
            this.dropSubText,
            this.dropHint,
            this.browseButton,
            this.browseText,
            this.supportedText
        );
    }

    resize(): void {
    }
}