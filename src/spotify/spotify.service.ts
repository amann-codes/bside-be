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

        if (access && access.expiresAt.getTime() > now + 60000) {
            await this.prismaService.client.spotifyAccess.update({
                where: {
                    id: 1
                },
                data: {
                    timesRequested: { increment: 1 },
                }
            })
            console.log('Token not expired');
            return access.accessToken;
        }

        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        };

        const body = new URLSearchParams({
            grant_type: 'client_credentials',
        });

        console.log('Token renewed');

        const req = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers,
            body,
        });

        const res = await req.json();

        const expiresAtMs = Date.now() + res.expires_in * 1000;

        const accessUpdate = await this.prismaService.client.spotifyAccess.upsert({
            where: { id: 1 },
            update: {
                accessToken: res.access_token,
                expiresAt: new Date(expiresAtMs),
                timeUpdates: { increment: 1 },
                timesRequested: { increment: 1 },
            },
            create: {
                id: 1,
                accessToken: res.access_token,
                expiresAt: new Date(expiresAtMs),
                tokenType: res.token_type,
            },
        });

        return accessUpdate.accessToken;
    }
    async SearchSpotifyEntity(query: string, limit = 20) {
        try {
            if (!query) {
                throw new Error("Query required to perform search")
            }

            const accessToken = await this.GetSpotifyAccessToken()
            if (!accessToken) {
                throw new Error("Failed to get access token")
            }

            const result = await fetch(
                `https://api.spotify.com/v1/search?q=${query}&type=album,artist,track&limit=${limit}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            )

            if (!result.ok) {
                throw new Error("Spotify search failed")
            }

            const res = await result.json()

            const tracks = res.tracks.items.map((t: any) => ({
                id: t.id,
                name: t.name,
                type: "track" as const,
                entityType: "track" as const,
                popularity: t.popularity,
                duration_ms: t.duration_ms,
                explicit: t.explicit,
                album_type: t.album.album_type,
                album: {
                    id: t.album.id,
                    name: t.album.name,
                    type: "album" as const,
                    images: t.album.images,
                    release_date: t.album.release_date,
                    album_type: t.album.album_type,
                    total_tracks: t.album.total_tracks,
                },
                artists: t.artists.map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    type: "artist" as const,
                    images: a.images ?? [],
                    genres: [],
                    popularity: a.popularity ?? 0,
                })),
            }))

            const artists = res.artists.items.map((a: any) => ({
                id: a.id,
                name: a.name,
                type: "artist" as const,
                entityType: "artist" as const,
                images: a.images,
                genres: a.genres,
                popularity: a.popularity,
            }))

            const albums = res.albums.items.map((a: any) => ({
                id: a.id,
                name: a.name,
                type: "album" as const,
                entityType: "album" as const,
                images: a.images,
                release_date: a.release_date,
                album_type: a.album_type,
                total_tracks: a.total_tracks,
            }))
            const albumPopularityMap = new Map<string, number>()

            for (const track of tracks) {
                const albumId = track.album.id
                const current = albumPopularityMap.get(albumId) ?? 0
                albumPopularityMap.set(
                    albumId,
                    Math.max(current, track.popularity)
                )
            }

            const unified = [
                ...tracks.map(t => ({
                    ...t,
                    _score: t.popularity,
                })),
                ...artists.map(a => ({
                    ...a,
                    _score: a.popularity,
                })),
                ...albums.map(a => ({
                    ...a,
                    _score: albumPopularityMap.get(a.id) ?? 0,
                })),
            ]

            unified.sort((a, b) => b._score - a._score)

            return unified.map(({ _score, ...entity }) => entity)

        } catch (e) {
            throw new Error(`Spotify search failed: ${e}`)
        }
    }

}
