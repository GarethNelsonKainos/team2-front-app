import type { Request, Response } from "express";
import type { ApplicationService } from "../services/applicationService.js";
import type { AuthController } from "./authController.js";

export class HomeController {
	private applicationService: ApplicationService;
	private authController: AuthController;
	constructor(
		applicationService: ApplicationService,
		authController: AuthController,
	) {
		this.applicationService = applicationService;
		this.authController = authController;
	}

	//home page shows user info and their applications if logged in, otherwise shows login/register options
	async getHomePage(req: Request, res: Response) {
		const user = res.locals.user;
		if (user) {
			try {
				const applications = await this.applicationService.getUserApplications(
					res.locals.token,
				);
				const isAdmin = res.locals.isAdmin;
				return res.render("home-page", {
					user,
					applications,
					showAuth: true,
					isAdmin,
				});
			} catch (error) {
				console.error("Error fetching user applications:", error);
				return res.render("home-page", {
					user,
					applications: [],
					showAuth: true,
					isAdmin: false,
				});
			}
		}
		res.render("home-page", {
			showAuth: false,
			user: null,
			applications: [],
			isAdmin: false,
		});
	}

	async getProfilePage(_req: Request, res: Response) {
		const user = res.locals.user;
		if (!user) {
			return res.redirect("/login");
		}
		try {
			const applications = await this.applicationService.getUserApplications(
				res.locals.token,
			);
			const isAdmin = res.locals.isAdmin;
			return res.render("profile", {
				user,
				applications,
				showAuth: true,
				isAdmin,
			});
		} catch (error) {
			console.error("Error fetching user applications:", error);
			return res.render("profile", {
				user,
				applications: [],
				showAuth: true,
				isAdmin: false,
			});
		}
	}

	async getAdminPage(_req: Request, res: Response) {
		const user = res.locals.user;
		if (!user) {
			return res.redirect("/login");
		}
		const isAdmin = res.locals.isAdmin;
		if (!isAdmin) {
			return res.status(403).send("Access denied. Admins only.");
		}
		res.render("admin-dashboard", { user, showAuth: true, isAdmin });
	}
}
