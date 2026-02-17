import { Router } from "express";
import multer from "multer";
import { JobRoleController } from "../UI/controllers/jobRoleController.js";
import { ApplicationController } from "../UI/controllers/applicationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

// Multer config: store files in memory (buffer)
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
	fileFilter: (req, file, cb) => {
		if (
			[
				"application/pdf",
				"application/msword",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			].includes(file.mimetype)
		) {
			cb(null, true);
		} else {
			cb(new Error("Only PDF, DOC, and DOCX files are allowed."));
		}
	},
});

export default function uiRouter(
	controller: JobRoleController,
	applicationController: ApplicationController,
) {
	const router = Router();

	router.get("/job-roles", (req, res) => controller.getJobRolesPage(req, res));
	router.get("/job-roles/:id", (req, res) =>
		controller.getJobRoleById(req, res),
	);
	router.get("/job-roles/:id/apply", authMiddleware, (req, res) => {
		applicationController.getApplicationForm(req, res);
	});

	router.post("/application", upload.single("CV"), authMiddleware, (req, res) =>
		applicationController.handleApplicationSubmit(req, res),
	);

	return router;
}
