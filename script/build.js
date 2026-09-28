const fs = require("fs");
const path = require("path");
const http = require("http");
const { exec } = require("child_process");
const esbuild = require("esbuild");

const ROOT_DIR = path.resolve(__dirname, "..");

const BUILD_DIR = path.join(
    ROOT_DIR,
    "build"
);

const CONFIG_FILE = path.join(
    ROOT_DIR,
    "buildConfig.json"
);

const DEFAULT_PORT = 3000;

const IGNORED_DIRECTORIES = new Set([
    "node_modules",
    "build",
    "scripts",
    ".git",
    ".vscode",
    ".idea"
]);

function getConfiguredProject() {
    if (!fs.existsSync(CONFIG_FILE)) {
        console.error("");
        console.error(
            "ERROR: buildConfig.json was not found."
        );
        console.error("");
        console.error(
            `
Expected: $ { CONFIG_FILE }
`
        );
        console.error("");

        process.exit(1);
    }

    try {
        const config = JSON.parse(
            fs.readFileSync(
                CONFIG_FILE,
                "utf8"
            )
        );

        if (!config.name ||
            typeof config.name !== "string"
        ) {
            console.error("");
            console.error(
                "ERROR: buildConfig.json must contain a valid project name."
            );
            console.error("");
            console.error(
                'Example: { "name": "game1" }'
            );
            console.error("");

            process.exit(1);
        }

        return config.name.trim();

    } catch (error) {
        console.error("");
        console.error(
            "ERROR: Invalid buildConfig.json."
        );
        console.error("");

        console.error(
            error.message
        );

        console.error("");

        process.exit(1);
    }
}

function getProjects() {
    if (!fs.existsSync(ROOT_DIR)) {
        return [];
    }

    const entries = fs.readdirSync(
        ROOT_DIR, {
            withFileTypes: true
        }
    );

    const projects = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue;
        }

        const projectName =
            entry.name;

        if (
            IGNORED_DIRECTORIES.has(
                projectName
            )
        ) {
            continue;
        }

        const projectDir =
            path.join(
                ROOT_DIR,
                projectName
            );

        const tsDir =
            path.join(
                projectDir,
                "ts"
            );

        const entryFile =
            path.join(
                tsDir,
                "index.ts"
            );

        if (
            fs.existsSync(tsDir) &&
            fs.statSync(tsDir).isDirectory() &&
            fs.existsSync(entryFile) &&
            fs.statSync(entryFile).isFile()
        ) {
            projects.push(
                projectName
            );
        }
    }

    projects.sort(
        (a, b) =>
        a.localeCompare(b)
    );

    return projects;
}

function projectExists(
    projectName
) {
    return getProjects().includes(
        projectName
    );
}

function validateProject(
    projectName
) {
    const projects =
        getProjects();

    if (!projects.includes(
            projectName
        )) {
        console.error("");
        console.error(
            `
ERROR: Project "${projectName}"
was not found.
`
        );
        console.error("");

        if (
            projects.length === 0
        ) {
            console.error(
                "No projects were found."
            );
        } else {
            console.error(
                "Available projects:"
            );

            for (
                const project
                of projects
            ) {
                console.error(
                    ` - $ { project }
`
                );
            }
        }

        console.error("");

        process.exit(1);
    }
}

function getProjectPaths(
    projectName
) {
    const projectDir =
        path.join(
            ROOT_DIR,
            projectName
        );

    const tsDir =
        path.join(
            projectDir,
            "ts"
        );

    const assetsDir =
        path.join(
            projectDir,
            "assets"
        );

    const htmlFile =
        path.join(
            projectDir,
            "index.html"
        );

    const buildProjectDir =
        path.join(
            BUILD_DIR,
            projectName
        );

    const buildJsDir =
        path.join(
            buildProjectDir,
            "js"
        );

    const buildJsFile =
        path.join(
            buildJsDir,
            "index.js"
        );

    const buildAssetsDir =
        path.join(
            buildProjectDir,
            "assets"
        );

    const buildHtmlFile =
        path.join(
            buildProjectDir,
            "index.html"
        );

    return {
        projectDir,
        tsDir,

        entryFile: path.join(
            tsDir,
            "index.ts"
        ),

        assetsDir,
        htmlFile,

        buildProjectDir,
        buildJsDir,
        buildJsFile,

        buildAssetsDir,
        buildHtmlFile
    };
}

function ensureDirectory(
    directory
) {
    fs.mkdirSync(
        directory, {
            recursive: true
        }
    );
}

function removeDirectory(
    directory
) {
    if (!fs.existsSync(directory)) {
        return;
    }

    fs.rmSync(
        directory, {
            recursive: true,
            force: true
        }
    );
}

function copyDirectory(
    source,
    destination
) {
    if (!fs.existsSync(source)) {
        return;
    }

    ensureDirectory(
        destination
    );

    const entries =
        fs.readdirSync(
            source, {
                withFileTypes: true
            }
        );

    for (
        const entry
        of entries
    ) {
        const sourcePath =
            path.join(
                source,
                entry.name
            );

        const destinationPath =
            path.join(
                destination,
                entry.name
            );

        if (
            entry.isDirectory()
        ) {
            copyDirectory(
                sourcePath,
                destinationPath
            );
        } else {
            fs.copyFileSync(
                sourcePath,
                destinationPath
            );
        }
    }
}

async function compileProject(
    projectName
) {
    validateProject(
        projectName
    );

    const paths =
        getProjectPaths(
            projectName
        );

    console.log("");
    console.log(
        "=========================================="
    );
    console.log(
        `
COMPILE: $ { projectName }
`
    );
    console.log(
        "=========================================="
    );

    console.log(
        `
Source: $ { paths.entryFile }
`
    );

    console.log(
        `
Output: $ { paths.buildJsFile }
`
    );

    console.log("");

    ensureDirectory(
        paths.buildJsDir
    );

    try {
        await esbuild.build({
            entryPoints: [
                paths.entryFile
            ],

            outfile: paths.buildJsFile,

            bundle: true,

            platform: "browser",

            format: "esm",

            target: "es2020",

            minify: false,

            sourcemap: false,

            tsconfig: path.join(
                ROOT_DIR,
                "tsconfig.json"
            ),

            absWorkingDir: paths.projectDir,

            logLevel: "info"
        });

        console.log("");
        console.log(
            `✓
Compile successful: $ { projectName }
`
        );

        console.log(
            `
$ { paths.buildJsFile }
`
        );

        console.log("");

    } catch (error) {
        console.error("");
        console.error(
            `✗
Compile failed: $ { projectName }
`
        );
        console.error("");

        throw error;
    }
}

function copyProjectAssets(
    projectName
) {
    const paths =
        getProjectPaths(
            projectName
        );

    console.log(
        "Copying assets..."
    );

    if (!fs.existsSync(
            paths.assetsDir
        )) {
        console.log(
            "  No assets directory found."
        );

        return;
    }

    removeDirectory(
        paths.buildAssetsDir
    );

    copyDirectory(
        paths.assetsDir,
        paths.buildAssetsDir
    );

    console.log(
        `✓
$ { paths.assetsDir }
`
    );

    console.log(
        "    ↓"
    );

    console.log(
        `✓
$ { paths.buildAssetsDir }
`
    );
}

function createDefaultHtml(
    projectName,
    outputFile
) {
    const html = ` < !DOCTYPE html >
    <
    html lang = "en" >

    <
    head >

    <
    meta charset = "UTF-8" >

    <
    meta
name = "viewport"
content = "width=device-width, initial-scale=1.0" >

    <
    title > PixiJS - $ { projectName } < /title>

<
style >

    html,
    body {
        margin: 0;
        padding: 0;
        width: 100 % ;
        height: 100 % ;
        overflow: hidden;
        background: #000;































































































































        }































































































































































































































































    </style>































































































































































































































































</head>































































































































































































































































<body>































































































































































































































































    <script































































































































        type= "module"
        src = "./js/index.js" >
        <
        /script>

        <
        /body>

        <
        /html>
        `;

    fs.writeFileSync(
        outputFile,
        html,
        "utf8"
    );
}

function copyProjectHtml(
    projectName
) {
    const paths =
        getProjectPaths(
            projectName
        );

    console.log(
        "Copying index.html..."
    );

    if (
        fs.existsSync(
            paths.htmlFile
        )
    ) {
        fs.copyFileSync(
            paths.htmlFile,
            paths.buildHtmlFile
        );

        console.log(
            `✓
        $ { paths.htmlFile }
        `
        );

        console.log(
            "    ↓"
        );

        console.log(
            `✓
        $ { paths.buildHtmlFile }
        `
        );

    } else {
        console.log(
            "  No index.html found."
        );

        console.log(
            "  Creating default index.html..."
        );

        createDefaultHtml(
            projectName,
            paths.buildHtmlFile
        );

        console.log(
            `✓
        $ { paths.buildHtmlFile }
        `
        );
    }
}

async function buildProject(
    projectName
) {
    validateProject(
        projectName
    );

    const paths =
        getProjectPaths(
            projectName
        );

    console.log("");
    console.log(
        "##########################################"
    );
    console.log(
        `
        BUILD: $ { projectName }
        `
    );
    console.log(
        "##########################################"
    );

    console.log("");
    console.log(
        "Cleaning previous build..."
    );

    removeDirectory(
        paths.buildProjectDir
    );

    ensureDirectory(
        paths.buildProjectDir
    );

    console.log(
        `✓
        $ { paths.buildProjectDir }
        `
    );

    await compileProject(
        projectName
    );

    console.log("");

    copyProjectAssets(
        projectName
    );

    console.log("");

    copyProjectHtml(
        projectName
    );

    console.log("");
    console.log(
        "------------------------------------------"
    );

    console.log(
        `✓
        BUILD COMPLETE: $ { projectName }
        `
    );

    console.log(
        `
        $ { paths.buildProjectDir }
        `
    );

    console.log(
        "------------------------------------------"
    );

    console.log("");
}

async function compileAll() {
    const projects =
        getProjects();

    if (
        projects.length === 0
    ) {
        console.error("");
        console.error(
            "ERROR: No projects found."
        );
        console.error("");

        process.exit(1);
    }

    console.log("");
    console.log(
        "Projects found:"
    );

    for (
        const project
        of projects
    ) {
        console.log(
            ` - $ { project }
        `
        );
    }

    console.log("");

    for (
        const project
        of projects
    ) {
        await compileProject(
            project
        );
    }

    console.log("");
    console.log(
        "=========================================="
    );
    console.log(
        "✓ ALL PROJECTS COMPILED"
    );
    console.log(
        "=========================================="
    );
    console.log("");
}

async function buildAll() {
    const projects =
        getProjects();

    if (
        projects.length === 0
    ) {
        console.error("");
        console.error(
            "ERROR: No projects found."
        );
        console.error("");

        process.exit(1);
    }

    console.log("");
    console.log(
        "=========================================="
    );
    console.log(
        "BUILDING ALL PROJECTS"
    );
    console.log(
        "=========================================="
    );

    console.log("");

    console.log(
        `
        Found $ { projects.length }
        project(s): `
    );

    for (
        const project
        of projects
    ) {
        console.log(
            ` - $ { project }
        `
        );
    }

    console.log("");

    for (
        const project
        of projects
    ) {
        await buildProject(
            project
        );
    }

    console.log("");
    console.log(
        "=========================================="
    );
    console.log(
        "✓ ALL PROJECTS BUILT"
    );
    console.log(
        "=========================================="
    );
    console.log("");
}

function getMimeType(
    filePath
) {
    const extension =
        path.extname(
            filePath
        ).toLowerCase();

    const mimeTypes = {
        ".html": "text/html; charset=utf-8",

        ".htm": "text/html; charset=utf-8",

        ".js": "text/javascript; charset=utf-8",

        ".mjs": "text/javascript; charset=utf-8",

        ".css": "text/css; charset=utf-8",

        ".json": "application/json; charset=utf-8",

        ".txt": "text/plain; charset=utf-8",

        ".xml": "application/xml; charset=utf-8",

        ".png": "image/png",

        ".jpg": "image/jpeg",

        ".jpeg": "image/jpeg",

        ".gif": "image/gif",

        ".svg": "image/svg+xml",

        ".webp": "image/webp",

        ".bmp": "image/bmp",

        ".ico": "image/x-icon",

        ".mp3": "audio/mpeg",

        ".wav": "audio/wav",

        ".ogg": "audio/ogg",

        ".mp4": "video/mp4",

        ".webm": "video/webm",

        ".mov": "video/quicktime",

        ".woff": "font/woff",

        ".woff2": "font/woff2",

        ".ttf": "font/ttf",

        ".otf": "font/otf"
    };

    return (
        mimeTypes[extension] ||
        "application/octet-stream"
    );
}

function createProjectBrowserHtml() {
    const projects =
        getProjects();

    const projectCards =
        projects.map(
            (project) => {

                return ` <
        div class = "project-card" >

        <
        div class = "project-name" >
        $ { escapeHtml(project) } <
        /div>

        <
        div class = "project-actions" >

        <
        a
        class = "open-button"
        href = "/${encodeURIComponent(project)}/" >
        Open <
        /a>

        <
        /div>

        <
        /div>
        `;
            }
        ).join("");

    if (
        projects.length === 0
    ) {
        return ` <
        !DOCTYPE html >
        <
        html >

        <
        head >

        <
        meta charset = "UTF-8" >

        <
        title > PixiJS Projects < /title>

        <
        /head>

        <
        body >

        <
        h1 > No Projects Found < /h1>

        <
        p >
        Create a project containing:
            <
            /p>

            <
            pre >
            A / └──ts / └──index.ts <
            /pre>

            <
            /body>

            <
            /html>
        `;
    }

    return ` <
        !DOCTYPE html >

        <
        html lang = "en" >

        <
        head >

        <
        meta charset = "UTF-8" >

        <
        meta
        name = "viewport"
        content = "width=device-width, initial-scale=1.0" >

        <
        title > PixiJS Projects < /title>

        <
        style >

        *
        {
            box - sizing: border - box;
        }

        body {

            margin: 0;

            padding: 40 px;

            min - height: 100 vh;

            font - family: Arial,
            Helvetica,
            sans - serif;

            background: #111827;































































































































































































































































    color:































































































































        # ffffff;
        }

        .container {

            width: 100 % ;

            max - width: 1100 px;

            margin: 0 auto;
        }

        .header {

            margin - bottom: 40 px;
        }

        .header h1 {

            margin: 0 0 10 px;

            font - size: 36 px;
        }

        .header p {

            margin: 0;

            color: #9ca3af;































































































































































































































































    font-size: 16px;































































































































}































































































































































































































































.projects {































































































































































































































































    display: grid;































































































































































































































































    grid-template-columns:































































































































        repeat(































































































































            auto-fill,































































































































            minmax(220px, 1fr)































































































































        );































































































































































































































































    gap: 20px;































































































































}































































































































































































































































.project-card {































































































































































































































































    padding: 24px;































































































































































































































































    border:































































































































        1px solid # 374151;

            border - radius: 14 px;

            background: #1f2937;































































































































































































































































    transition:































































































































        transform 0.15s ease,































































































































        border-color 0.15s ease;































































































































}































































































































































































































































.project-card:hover {































































































































































































































































    transform:































































































































        translateY(-3px);































































































































































































































































    border-color:































































































































        # 4 f46e5;
        }

        .project - name {

            margin - bottom: 20 px;

            font - size: 24 px;

            font - weight: 700;
        }

        .open - button {

            display: inline - block;

            padding: 10 px 18 px;

            border - radius: 8 px;

            background: #4f46e5;































































































































































































































































    color:































































































































        # ffffff;

            text - decoration: none;

            font - weight: 600;
        }

        .open - button: hover {

            background: #4338ca;































































































































}































































































































































































































































</style>































































































































































































































































</head>































































































































































































































































<body>































































































































































































































































<div class= "container" >

                <
                div class = "header" >

                <
                h1 >
                PixiJS Projects <
                /h1>

                <
                p >
                Select a project to open. <
                /p>

                <
                /div>

                <
                div class = "projects" >

                $ { projectCards }

                <
                /div>

                <
                /div>

                <
                /body>

                <
                /html>
            `;
}

function escapeHtml(
    value
) {
    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}

function isPathInside(
    parent,
    child
) {
    const parentPath =
        path.resolve(parent) +
        path.sep;

    const childPath =
        path.resolve(child);

    return (
        childPath.startsWith(
            parentPath
        ) ||
        childPath ===
        path.resolve(parent)
    );
}

function startServer(
    selectedProject = null
) {
    ensureDirectory(
        BUILD_DIR
    );

    const server =
        http.createServer(
            (request, response) => {

                try {

                    let requestUrl =
                        request.url || "/";

                    requestUrl =
                        requestUrl.split("?")[0];

                    requestUrl =
                        decodeURIComponent(
                            requestUrl
                        );

                    if (
                        requestUrl === "/" ||
                        requestUrl === ""
                    ) {

                        response.writeHead(
                            200, {
                                "Content-Type": "text/html; charset=utf-8"
                            }
                        );

                        response.end(
                            createProjectBrowserHtml()
                        );

                        return;
                    }

                    let relativePath =
                        requestUrl.replace(
                            /^\/+/,
                            ""
                        );

                    if (
                        relativePath.endsWith("/")
                    ) {
                        relativePath +=
                            "index.html";
                    }

                    const requestedFile =
                        path.resolve(
                            BUILD_DIR,
                            relativePath
                        );

                    if (!isPathInside(
                            BUILD_DIR,
                            requestedFile
                        )) {

                        response.writeHead(
                            403
                        );

                        response.end(
                            "Forbidden"
                        );

                        return;
                    }

                    if (!fs.existsSync(
                            requestedFile
                        )) {

                        response.writeHead(
                            404, {
                                "Content-Type": "text/plain; charset=utf-8"
                            }
                        );

                        response.end(
                            "404 - File Not Found"
                        );

                        return;
                    }

                    const stats =
                        fs.statSync(
                            requestedFile
                        );

                    if (
                        stats.isDirectory()
                    ) {

                        response.writeHead(
                            403
                        );

                        response.end(
                            "Directory listing disabled"
                        );

                        return;
                    }

                    const mimeType =
                        getMimeType(
                            requestedFile
                        );

                    response.writeHead(
                        200, {
                            "Content-Type": mimeType,

                            "Cache-Control": "no-cache"
                        }
                    );

                    const stream =
                        fs.createReadStream(
                            requestedFile
                        );

                    stream.pipe(
                        response
                    );

                    stream.on(
                        "error",
                        () => {

                            if (!response.headersSent) {
                                response.writeHead(
                                    500
                                );
                            }

                            response.end(
                                "Internal Server Error"
                            );
                        }
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                    if (!response.headersSent) {
                        response.writeHead(
                            500
                        );
                    }

                    response.end(
                        "Internal Server Error"
                    );
                }
            }
        );

    server.listen(
        DEFAULT_PORT,
        "localhost",
        () => {

            const url =
                selectedProject ?
                `
            http: //localhost:${DEFAULT_PORT}/${encodeURIComponent(selectedProject)}/` :
                `http://localhost:${DEFAULT_PORT}/`;

            console.log("");

            console.log(
                "=========================================="
            );

            console.log(
                "PixiJS Development Server"
            );

            console.log(
                "=========================================="
            );

            console.log("");

            console.log(
                `Server: ${url}`
            );

            console.log("");

            const projects =
                getProjects();

            console.log(
                "Available projects:"
            );

            for (
                const project
                of projects
            ) {

                console.log(
                    `  ${project} -> http://localhost:${DEFAULT_PORT}/${encodeURIComponent(project)}/`
                );
            }

            console.log("");

            console.log(
                "Press Ctrl+C to stop."
            );

            console.log("");

            openBrowser(
                url
            );
        }
    );
}

function openBrowser(
    url
) {
    let command;

    if (
        process.platform ===
        "win32"
    ) {

        command =
            `start "" "${url}"`;

    } else if (
        process.platform ===
        "darwin"
    ) {

        command =
            `open "${url}"`;

    } else {

        command =
            `xdg-open "${url}"`;
    }

    exec(
        command,
        (error) => {

            if (error) {

                console.log(
                    "Could not automatically open browser."
                );

                console.log(
                    `Open manually: ${url}`
                );
            }
        }
    );
}

function showHelp() {

    console.log(`

PixiJS Multi Project Builder
============================

PROJECT STRUCTURE

A/
├── assets/
└── ts/
    └── index.ts

B/
├── assets/
└── ts/
    └── index.ts

C/
└── ts/
    └── index.ts


BUILD CONFIG

buildConfig.json

{
    "name": "A"
}


COMMANDS

Using buildConfig.json:

    npm run compile

    npm run build

    npm run serve


Explicit project:

    npm run compile -- A

    npm run build -- A

    npm run serve -- A


All projects:

    npm run compile -- all

    npm run build -- all

`);
}

async function main() {

    const command =
        process.argv[2];

    let argument =
        process.argv[3];

    if (!argument &&
        (
            command === "compile" ||
            command === "build" ||
            command === "serve"
        )
    ) {
        argument =
            getConfiguredProject();
    }

    try {

        switch (command) {

            case "compile":

                if (
                    argument === "all"
                ) {

                    await compileAll();

                } else {

                    await compileProject(
                        argument
                    );
                }

                break;

            case "build":

                if (
                    argument === "all"
                ) {

                    await buildAll();

                } else {

                    await buildProject(
                        argument
                    );
                }

                break;

            case "serve":

                if (
                    argument
                ) {
                    validateProject(
                        argument
                    );
                }

                startServer(
                    argument || null
                );

                break;

            case "help":
            case "--help":
            case "-h":
            case undefined:

                showHelp();

                break;

            default:

                console.error("");
                console.error(
                    `Unknown command: ${command}`
                );
                console.error("");

                showHelp();

                process.exit(1);
        }

    } catch (error) {

        console.error("");
        console.error(
            "=========================================="
        );
        console.error(
            "BUILD SYSTEM ERROR"
        );
        console.error(
            "=========================================="
        );
        console.error("");

        if (
            error &&
            error.message
        ) {

            console.error(
                error.message
            );

        } else {

            console.error(
                error
            );
        }

        console.error("");

        process.exit(1);
    }
}

main();