import { Router } from "express";
import { AuthController } from "../UI/controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware.js";

export default function authRouter(authController: AuthController) {
	const router = Router();

	router.get("/login", (_req, res) => authController.getLoginPage(_req, res));
	router.get("/register", (_req, res) =>
		authController.getRegisterPage(_req, res),
	);
	router.get("/logout", (req, res) => authController.logout(req, res));

	router.post("/login", (req, res) => authController.postLogin(req, res));
	router.post("/register", (req, res) => authController.postRegister(req, res));

	return router;
}
