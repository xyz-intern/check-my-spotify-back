import { Controller, Get } from '@nestjs/common';
import { SortService } from './sort.service';
@Controller('sort')
export class SortController {
  constructor(private readonly sortService: SortService) { }

    @Get('/favorite/song')
    async favoriteSongs(): Promise<object>{
      return await this.sortService.favoriteSongs();
    }
    
    @Get('/heard/artists')
    async lovitArtists(): Promise<object> {
      return await this.sortService.heardALotArtists();
    }

    @Get('/last/song')
    async lastSongs(): Promise<object>{
      return await this.sortService.lastSongs();
    }
}
