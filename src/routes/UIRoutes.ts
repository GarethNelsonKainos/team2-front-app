import { Router } from "express";
import { JobRoleController } from "../UI/controllers/jobRoleController.js";

const router = Router();
const controller = new JobRoleController();

router.get("/job-roles", (req, res) => controller.getJobRolesPage(req, res));
router.get("/job-roles/:id", (req, res) => controller.getJobRoleById(req, res));

export default router;
