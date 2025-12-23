import { Inject, Injectable } from "@nestjs/common";
import { CustomPrismaService } from "nestjs-prisma";
import { ExtendedPrismaClient } from "prisma.extension";
import { GoogleSignInDTO, UserDTO } from "./dto/login.dto";

@Injectable()
export class AuthService {
    constructor(
        @Inject('PrismaService')
        private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>
    ) { }
    async googleSignIn(body: GoogleSignInDTO): Promise<{ message: string; status: string; user?: UserDTO }> {
        try {
            if (!body) {
                return {
                    message: "Signin Data Required",
                    status: "failed"
                }
            }
            const user = await this.prismaService.client.user.upsert({
                where: { email: body.user.email },
                update: {
                    name: body.user?.name,
                    image: body.user?.image
                },
                create: {
                    name: body.user?.name,
                    email: body.user.email,
                    image: body.user?.image,
                },
            })
            if (!user) {
                return {
                    message: "User Not Found",
                    status: "failed"
                }
            }
            await this.prismaService.client.account.upsert({
                where: {
                    providerId_providerAccountId: {
                        providerId: body.providerId,
                        providerAccountId: body.providerAccountId,
                    },
                },
                update: {
                    accessToken: body.accessToken,
                    refreshToken: body.refreshToken,
                    accessTokenExpires: body.accessTokenExpires,
                },
                create: {
                    userId: user.id,
                    providerId: body.providerId,
                    providerAccountId: body.providerAccountId,
                    accessToken: body.accessToken,
                    refreshToken: body.refreshToken,
                    accessTokenExpires: body.accessTokenExpires,
                },
            })
            return {
                message: "Signed in successfully",
                status: 'success',
                user
            }
        } catch (e) {
            throw new Error(`Signing in with Google\n ${e}`)
        }
    }
}