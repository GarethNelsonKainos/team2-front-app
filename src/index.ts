import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import jobRoleRouter from "./routes/JobRoleRoutes.js";
import authRouter from "./routes/AuthRoutes.js";
import applicationRouter from "./routes/applicationRoutes.js";
import homeRouter from "./routes/homeRoutes.js";

import { ApplicationController } from "./controllers/applicationController.js";
import { ApplicationService } from "./services/applicationService.js";
import { JobRoleController } from "./controllers/jobRoleController.js";
import { JobRoleService } from "./services/jobRoleService.js";
import { AuthService } from "./services/authService.js";
import { AuthController } from "./controllers/authController.js";
import { HomeController } from "./controllers/homeController.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { decodeTokenMiddleware } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authService = new AuthService();
const authController = new AuthController(authService);
const applicationService = new ApplicationService();
const jobRoleService = new JobRoleService(applicationService);
const jobRoleController = new JobRoleController(
	jobRoleService,
	applicationService,
);
const applicationController = new ApplicationController(
	applicationService,
	jobRoleService,
);
const homeController = new HomeController(applicationService);

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use(decodeTokenMiddleware);

app.get("/", async (_req, res) => {
	res.render("home-page", { showAuth: true, user: null, applications: [] });
});
app.use("/", authRouter(authController));
app.use("/", jobRoleRouter(jobRoleController, applicationController));
app.use("/", applicationRouter(applicationController));
app.use("/", homeRouter(homeController));

app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
