import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";

const app = express();

app.use(cors({
    origin: "http://localhost:3000"
}));

const assetsPath = path.join(process.cwd(), "public", "assets");

if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, assetsPath);
    },

    filename: (_req, file, callback) => {
        callback(null, file.originalname);
    }
});

const upload = multer({ storage });

app.post("/upload", upload.array("files"), (req, res) => {
    const files = req.files as Express.Multer.File[];

    const uploadedFiles = files.map(file => ({
        name: file.originalname,
        path: `/assets/${file.originalname}`,
        size: file.size
    }));

    res.json({
        success: true,
        message: "Files uploaded successfully.",
        files: uploadedFiles
    });
});

app.listen(3001, () => {
    console.log("Upload server running on http://localhost:3001");
});