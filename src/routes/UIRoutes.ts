import { Router } from 'express';
import { JobRoleController } from '../UI/controllers/jobRoleController.js';
import { LoginController } from '../UI/controllers/loginController.js';

const router = Router();
const controller = new JobRoleController();
const loginController = new LoginController();

router.get("/job-roles", (req, res) => controller.getJobRolesPage(req, res));
router.get("/job-roles/:id", (req, res) => controller.getJobRoleById(req, res));

router.get('/login', (req, res) => {
res.render('home-page', { showLoginModal: true});
});

router.post('/login', (req, res) => loginController.handleLogin(req, res));

router.get('/logged-in', (req, res) => {
    res.render('logged-in');
});

export default router;
