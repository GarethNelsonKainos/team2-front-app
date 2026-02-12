import { Router } from 'express';
import { JobRoleController } from '../UI/controllers/jobRoleController.js';

const router = Router();
const controller = new JobRoleController();

router.get('/job-roles', (req, res) => controller.getJobRolesPage(req, res));
router.get('/job-roles/:id', (req, res) => controller.getJobRoleById(req, res));

router.get('/login', (req, res) => {
res.render('home-page', { showLoginModal: true});
});

export default router;