import { Request, Response } from "express";
import { ApplicationService } from "../services/applicationService.js";

export class HomeController {
    private applicationService: ApplicationService
    constructor(applicationService: ApplicationService) {
        this.applicationService = applicationService;
    }

    //home page shows user info and their applications if logged in, otherwise shows login/register options
    async getHomePage(req: Request, res: Response) {
        const user = res.locals.user;
        if (user) {
            try {
                const applications = await this.applicationService.getApplicationsByUserId(res.locals.token);
                return res.render("home-page", { user, applications });
            } catch (error) {
                console.error("Error fetching user applications:", error);
                return res.render("home-page", { user, applications: [] });
            }
        }
        res.render("home-page", { showAuth: true, user: null, applications: [] });
    }
}