import { Router } from "express";
import { HomeController } from "../controllers/homeController.js";

export default function homeRouter(controller: HomeController) {
	const router = Router();
	router.get("/home", (req, res) => controller.getHomePage(req, res));
	return router;
}
