import { Router } from "express";
import type { JobRoleController } from "../controllers/jobRoleController.js";
import type { ApplicationController } from "../controllers/applicationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export default function uiRouter(
	controller: JobRoleController,
	applicationController: ApplicationController,
) {
	const router = Router();

	router.get("/job-roles", (req, res) => controller.getJobRolesPage(req, res));
	router.get("/new-role", (req, res) =>
		controller.getCreateJobRolePage(req, res),
	);
	router.post("/job-roles", (req, res) => controller.createJobRole(req, res));
	router.get("/job-roles/:id", (req, res) =>
		controller.getJobRoleById(req, res),
	);
	router.get("/job-roles/:id/apply", authMiddleware, (req, res) => {
		applicationController.getApplicationForm(req, res);
	});

	return router;
}
