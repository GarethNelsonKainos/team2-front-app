import express from "express";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import UIRoutes from "./routes/UIRoutes.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "UI/views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));
app.use("/", UIRoutes);

app.get("/", (req: Request, res: Response, next: NextFunction) => {
	res.render("home-page", { title: "Home", token: null });
});

app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
