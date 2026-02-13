import { Router } from "express";
import { JobRoleController } from "../UI/controllers/jobRoleController.js";
import { LoginController } from "../UI/controllers/loginController.js";

const router = Router();
const controller = new JobRoleController();
const loginController = new LoginController();

router.get("/job-roles", (req, res) => controller.getJobRolesPage(req, res));
router.get("/job-roles/:id", (req, res) => controller.getJobRoleById(req, res));

router.get("/login", (_req, res) => {
	res.render("login-page", { user: null, token: null });
});

router.post("/login", (req, res) => loginController.handleLogin(req, res));

// Temporary route for logged-in page to test login functionality
router.get("/logged-in", (_req, res) => {
	res.render("logged-in");
});

export default router;
