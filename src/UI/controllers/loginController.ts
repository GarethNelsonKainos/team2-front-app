import { Request, Response } from "express";
import { loginUser } from "../services/loginService";
import { error } from "node:console";

export class LoginController {
  async handleLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      console.log(email, password);
      const data = await loginUser(email, password);
      if (data && data.token) {
        res.render("home-page", { showLoginModal: false });
        console.log("Login successful, token received:", data.token);
      } else {
        res.status(401).render("home-page", { showLoginModal: true, error: "Invalid email or password." });
      }
    } catch (error) {
      res.status(500).send("Server error during login.");
    }
  }
}
