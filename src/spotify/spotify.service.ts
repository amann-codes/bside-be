import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma.extension';

@Injectable()
export class SpotifyService {
    constructor(
        @Inject('PrismaService')
        private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>
    ) { }
    async GetSpotifyAccessToken() {

        const access = await this.prismaService.client.spotifyAccess.findFirst();
        const now = Date.now();
        const buffer = 300;

        if (access && access.expiresAt.getTime() > (now + buffer)) {
            console.log('Token not expired')
            return access.accessToken;
        }

        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        const option = {
            method: "POST",
            url: "https://accounts.spotify.com/api/token",
            form: {
                grant_type: 'client_credentials'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')),
            },
        }
        console.log('Token not expired')

        const req = await fetch(option.url, {
            method: option.method,
            body: new URLSearchParams(option.form),
            headers: option.headers,
        })

        const res = await req.json()
        const expiryDate = new Date(Date.now() + (res.expires_in));

        const accessUpdate = await this.prismaService.client.spotifyAccess.upsert({
            where: { id: 1 },
            update: {
                accessToken: res.access_token,
                expiresAt: expiryDate,
                timeUpdates: {
                    increment: 1
                }

            },
            create: {
                accessToken: res.access_token,
                expiresAt: expiryDate,
                tokenType: res.token_type
            }
        })

        return accessUpdate.accessToken
    }

    async SearchSpotifyEntity(query: string) {
        try {
            if (!query) {
                throw new Error(`Query required to perform search`)
            }

            const accessToken = await this.GetSpotifyAccessToken();

            if (!accessToken) {
                throw new Error(`Getting access token`)
            }

            const option = {
                method: "GET",
                url: `https://api.spotify.com/v1/search?q=${query}&type=album,artist,track`,
                headers: {
                    "Content-Type": "applcation-json",
                    Authorization: `Bearer ${accessToken}`
                }
            }

            const result = await fetch(option.url, {
                method: option.method,
                headers: option.headers,
            })

            if (!result) {
                throw new Error("Getting search reasult")
            }

            const res = await result.json()

            return res;

        } catch (e) {
            throw new Error(`searching you query: ${e}`)
        }
    }
}
