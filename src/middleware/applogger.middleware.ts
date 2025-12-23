import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class ApploggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP')

    use(req: Request, res: Response, next: NextFunction): void {
        const startTime = Date.now();

        this.logger.log({
            Request: {
                method: req.method,
                url: req.originalUrl,
                headers: req.headers,
                body: req.body,
            }
        })

        res.on("finish", () => {
            const endTime = Date.now();
            const processingTime = endTime - startTime;
            this.logger.log({
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                contentLength: res.get('content-length') || '0',
                processingTime: `${processingTime}ms`,
            })
        })
        next();
    }
}