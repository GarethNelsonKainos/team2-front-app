import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import type { ApplicationController } from "../controllers/applicationController.js";

const ACCEPTED_MIME_TYPES = [
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
// Multer config: store files in memory (buffer)
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
	fileFilter: (req, file, cb) => {
		if (ACCEPTED_MIME_TYPES.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Only PDF, DOC, and DOCX files are allowed."));
		}
	},
});

export default function applicationRouter(
	applicationController: ApplicationController,
) {
	const router = Router();

	router.post("/application", upload.single("CV"), authMiddleware, (req, res) =>
		applicationController.handleApplicationSubmit(req, res),
	);

	router.get("/myApplications", authMiddleware, (req, res) =>
		applicationController.getUserApplications(req, res),
	);

	router.post(
		"/admin/application/:applicationID/:newStatus",
		authMiddleware,
		(req, res) => applicationController.updateApplicationStatus(req, res),
	);

	return router;
}
