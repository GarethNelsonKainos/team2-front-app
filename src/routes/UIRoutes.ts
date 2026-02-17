import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { JobRoleController } from "../UI/controllers/jobRoleController.js";
import { LoginController } from "../UI/controllers/loginController.js";
import { LogoutController } from "../UI/controllers/logoutController.js";
import jwt from "jsonwebtoken";
import { RegisterController } from "../UI/controllers/registerController.js";
import { ApplicationController } from "../UI/controllers/applicationController.js";

const router = Router();

// Multer config: store files in memory (buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed."));
    }
  },
});
const controller = new JobRoleController();
const loginController = new LoginController();
const logoutController = new LogoutController();
const registerController = new RegisterController();
const applicationController = new ApplicationController();

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

router.post("/register", (req, res) =>
	registerController.handleRegister(req, res),
);

// File upload route (application form submit)
router.post("/createApplication", upload.single("CV"), (req, res) => applicationController.handleApplicationSubmit(req, res));

//protected routes
router.get("/job-roles", (req, res) => controller.getJobRolesPage(req, res));
router.get("/job-roles/:id", (req, res) => controller.getJobRoleById(req, res));
// can only see this page if logged in
router.get("/job-roles/:id/apply", authMiddleware, (req, res) => {
	applicationController.getApplicationForm(req, res);
});

// Temporary route for logged-in page to test login functionality
router.get("/logged-in", (_req, res) => {
	res.render("logged-in");
});

export default router;
