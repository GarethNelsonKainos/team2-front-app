import { Request, Response } from "express";
import { loginUser } from "../services/loginService";
import jwt from "jsonwebtoken";

export class LoginController {
	async handleLogin(req: Request, res: Response) {
		try {
			const { email, password } = req.body;
			console.log(email, password);
			const data = await loginUser(email, password);
			if (data && data.token) {
				const decodedToken: any = jwt.decode(data.token);
				res.render("home-page", {
					token: data.token,
					user: decodedToken,
				});
				console.log("Decoded token:", decodedToken);
				console.log("Login successful, token received:", data.token);
			} else {
				res.status(401).render("login-page", {
					token: null,
					user: null,
					error: "Invalid email or password.",
				});
			}
		} catch (_error) {
			res.status(500).render("login-page", {
				token: null,
				user: null,
				error: "Server error during login.",
			});
		}
	}
}
