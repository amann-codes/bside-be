import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SpotifyService } from './spotify.service';

@Controller('spotify')
export class SpotifyController {
    constructor(
        private spotifyService: SpotifyService,
    ) { }

    @Get('/search/')
    async SearchEntityController(@Query('query') query: string) {
        const res = await this.spotifyService.SearchSpotifyEntity(query)
        return res;
    }

    @Get('/get/album/')
    async GetAlbumController(@Query('id') id: string) {
        const res = await this.spotifyService.GetAlbum(id)
        return res
    }

    @Get('/get/artist/')
    async GetArtistController(@Query('id') id: string) {
        const res = await this.spotifyService.GetArtist(id)
        return res
    }

    @Get('/get/track/')
    async GetTrackontroller(@Query('id') id: string) {
        const res = await this.spotifyService.GetTrack(id)
        return res
    }

}
