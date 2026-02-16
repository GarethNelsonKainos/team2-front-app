import express from "express";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import UIRoutes from "./routes/UIRoutes.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "UI/views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/", UIRoutes);

app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
