import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import uiRouter from "./routes/UIRoutes.js";
import authRouter from "./routes/AuthRoutes.js";

import { ApplicationController } from "./UI/controllers/applicationController.js";
import { ApplicationService } from "./UI/services/applicationService.js";
import { JobRoleController } from "./UI/controllers/jobRoleController.js";
import { JobRoleService } from "./UI/services/jobRoleService.js";
import { AuthService } from "./UI/services/authService.js";
import { AuthController } from "./UI/controllers/authController.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import {
	attachTokenMiddleware,
	decodeTokenMiddleware,
} from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authService = new AuthService();
const authController = new AuthController(authService);
const jobRoleService = new JobRoleService();
const jobRoleController = new JobRoleController();
const applicationService = new ApplicationService();
const applicationController = new ApplicationController();

app.set("views", path.join(__dirname, "UI/views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use(attachTokenMiddleware);
app.use(decodeTokenMiddleware);

app.get("/", async (_req, res) => {
	const token = _req.cookies.token;
	const user = token ? jwt.decode(token) : null;
	res.render("home-page", { user, showAuth: true });
});
app.use("/", authRouter(authController));
app.use("/", uiRouter(jobRoleController, applicationController));

app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
