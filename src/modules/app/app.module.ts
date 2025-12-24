import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ApploggerMiddleware } from "src/middleware/applogger.middleware";
import { AuthMiddleware } from "src/middleware/auth.middleware";
import { AuthModule } from "../auth/auth.module";
import { CustomPrismaModule } from "nestjs-prisma";
import { createPrismaClient } from "prisma.extension";
import { ConfigModule, ConfigService } from "@nestjs/config";
import appConfig from "src/config/app.config";
import { SpotifyModule } from "src/spotify/spotify.module";

@Module({
    controllers: [],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig]
        }),
        CustomPrismaModule.forRootAsync({
            isGlobal: true,
            name: 'PrismaService',
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const databaseURL = config.get<string>("DATABASE_URL");

                if (!databaseURL) {
                    throw new Error(`Invalid database url: ${databaseURL}`);
                }

                return createPrismaClient(databaseURL);
            },
        }),

        AuthModule,
        SpotifyModule
    ],
    providers: []
})

export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ApploggerMiddleware).forRoutes({ path: "*path", method: RequestMethod.ALL });
        consumer.apply(AuthMiddleware).forRoutes({ path: "*path", method: RequestMethod.ALL });
    }
}