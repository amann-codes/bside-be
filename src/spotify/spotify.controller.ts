import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SpotifyService } from './spotify.service';

@Controller('spotify')
export class SpotifyController {
    constructor(
        private spotifyService: SpotifyService,
    ) { }

    @Get('/search/')
    async SearchEntity(@Query('query') query: string) {
        const res = await this.spotifyService.SearchSpotifyEntity(query)
        return res;
    }

}
