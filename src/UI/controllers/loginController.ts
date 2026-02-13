import { Request, Response } from "express";
import { loginUser } from "../services/loginService";
import { error } from "node:console";
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
					showLoginModal: false,
					token: data.token,
					user: decodedToken,
				});
				console.log("Decoded token:", decodedToken);
				console.log("Login successful, token received:", data.token);
			} else {
				res
					.status(401)
					.render("home-page", {
						showLoginModal: true,
						token: null,
						error: "Invalid email or password.",
					});
			}
		} catch (error) {
			res
				.status(500)
				.render("home-page", {
					showLoginModal: true,
					token: null,
					error: "Server error during login.",
				});
		}
	}
}
