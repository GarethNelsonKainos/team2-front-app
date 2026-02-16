import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { JobRoleController } from "../UI/controllers/jobRoleController.js";
import { LoginController } from "../UI/controllers/loginController.js";
import { LogoutController } from "../UI/controllers/logoutController.js";
import jwt from "jsonwebtoken";
import { RegisterController } from "../UI/controllers/registerController.js";

const router = Router();
const controller = new JobRoleController();
const loginController = new LoginController();
const logoutController = new LogoutController();
const registerController = new RegisterController();

//public routes
router.get("/", (_req, res) => {
	const token = _req.cookies.token;
	const user = token ? jwt.decode(token) : null;
	res.render("home-page", { user, showAuth: true });
});

router.get("/login", (_req, res) => {
	res.render("login-page", { user: null, token: null, activeTab: "login" });
});

router.get("/register", (_req, res) => {
	res.render("login-page", { user: null, token: null, activeTab: "register" });
});

router.post("/login", (req, res) => loginController.handleLogin(req, res));

router.get("/logout", (req, res) => logoutController.handleLogout(req, res));

//protected routes
router.get("/job-roles", authMiddleware, (req, res) =>
	controller.getJobRolesPage(req, res),
);
router.get("/job-roles/:id", authMiddleware, (req, res) =>
	controller.getJobRoleById(req, res),
);

router.post("/register", (req, res) =>
	registerController.handleRegister(req, res),
);

// Temporary route for logged-in page to test login functionality
router.get("/logged-in", (_req, res) => {
	res.render("logged-in");
});

export default router;
