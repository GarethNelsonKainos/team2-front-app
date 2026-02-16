import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.redirect("/login");
    }

    next();
};