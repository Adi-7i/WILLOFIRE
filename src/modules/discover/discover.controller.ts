import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { DiscoverService } from './discover.service';
import { GetDiscoverDto } from './dto/get-discover.dto';

@Controller('discover')
export class DiscoverController {
    constructor(private readonly discoverService: DiscoverService) { }

    /**
     * GET /api/v1/discover
     * Returns the latest/highest-ranked news feed.
     * Accessible unauthenticated.
     */
    @Public()
    @Get()
    async getFeed(@Query() query: GetDiscoverDto) {
        return this.discoverService.getArticles(query.category, query.limit);
    }
}
