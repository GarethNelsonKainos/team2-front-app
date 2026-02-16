import { Router } from "express";
import { JobRoleController } from "../UI/controllers/jobRoleController.js";
import { LoginController } from "../UI/controllers/loginController.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const router = Router();
const controller = new JobRoleController();
const loginController = new LoginController();

router.get("/job-roles", (req, res) => controller.getJobRolesPage(req, res));
router.get("/job-roles/:id", (req, res) => controller.getJobRoleById(req, res));
router.get("/new-role", (req, res) => controller.getNewRolePage(req, res));

router.get("/login", (req: AuthenticatedRequest, res) => {
	res.set("Cache-Control", "no-store");
	res.render("home-page", {
		showLoginModal: true,
		user: req.user || null,
		token: req.cookies?.authToken || null,
	});
});

router.post("/login", (req, res) => loginController.handleLogin(req, res));
router.post("/logout", (req, res) => loginController.handleLogout(req, res));

// Temporary route for logged-in page to test login functionality
router.get("/logged-in", (_req, res) => {
	res.render("logged-in");
});

export default router;
