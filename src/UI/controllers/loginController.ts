import { Request, Response } from "express";
import { loginUser } from "../services/loginService";

export class LoginController {
    async handleLogin(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const data = await loginUser(email, password);
            if (data && data.token) {
                res.render("logged-in");
            } else {
                res.status(401).send("Login failed: Invalid response.");
            }
        } catch (error) {
            res.status(500).send("Server error during login.");
        }
    }
}
