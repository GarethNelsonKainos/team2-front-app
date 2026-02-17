import type { Request, Response } from "express";
import { registerUser } from "../services/registerService.js";
import jwt from "jsonwebtoken";

export class RegisterController {
	async handleRegister(req: Request, res: Response) {
		try {
			const { firstName, secondName, email, password, confirmedPassword } =
				req.body;

			const data = await registerUser(
				firstName,
				secondName,
				email,
				password,
				confirmedPassword,
			);

			if (data?.error) {
				res.status(data.status ?? 400).render("login-page", {
					token: null,
					user: null,
					error: data.error,
					activeTab: "register",
				});
				return;
			}

			if (data?.token) {
				const jwtSecret = process.env.JWT_SECRET;
				if (!jwtSecret) {
					return res.status(500).render("login-page", {
						token: null,
						user: null,
						error: "Server misconfiguration: JWT secret missing.",
						activeTab: "register",
					});
				}
				try {
					const decodedToken = jwt.verify(data.token, jwtSecret);
					res.render("home-page", {
						token: data.token,
						user: decodedToken,
					});
				} catch {
					res.status(401).render("login-page", {
						token: null,
						user: null,
						error: "Invalid or expired token.",
						activeTab: "register",
					});
				}
			} else {
				res.status(400).render("login-page", {
					token: null,
					user: null,
					error: "Registration failed. Please try again.",
					activeTab: "register",
				});
			}
		} catch (_error) {
			res.status(500).render("login-page", {
				token: null,
				user: null,
				error: "Server error during registration.",
				activeTab: "register",
			});
		}
	}
}
