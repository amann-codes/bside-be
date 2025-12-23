import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        const authRoute = '/auth';
        const globalPrefix = "/api";
        const currentPath = req.originalUrl.startsWith(globalPrefix) ? req.originalUrl.slice(globalPrefix.length) : req.originalUrl;

        console.log("processed path", currentPath);

        if (authRoute == currentPath) {
            console.log("auth route accessed", authRoute);
            return next();
        }

        console.log("protected route accessed", currentPath);

        let token = req.headers['authorization'];
        if (!token) {
            console.log("No token found")
            return res.status(401).send("Access Denied, No Token Found")
        }
        if (token.startsWith("Bearer ")) {
            token = token.slice(7);
        }
        if (token !== process.env.SECRET_KEY) {
            console.log("Invalid token");
            return res.status(401).send("Access Denied, Invalid Token")
        }
        next();
    }
}