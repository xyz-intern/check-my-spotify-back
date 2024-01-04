import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChartsService } from './charts.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Chart')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @ApiOperation({summary: '글로벌 TOP 50'})
  @Get('/top/songs')
  async topSongs(): Promise<Object>{
    return await this.chartsService.topSongs();
  }

  @ApiOperation({summary: 'TOP 아티스트'})
  @Get('/top/artist')
  async topArtists(): Promise<object> {
    return await this.chartsService.topArtists();
  }

  @ApiOperation({summary: '가장 많이 들은 노래'})
  @Get('/favorite/song')
  async favoriteSongs(): Promise<object> {
    return await this.chartsService.favoriteSongs();
  }

  @ApiOperation({summary: '가장 많이 들은 아티스트'})
  @Post('/heard/artists')
  async lovitArtists(@Body("userId") userId: string): Promise<object> {
    return await this.chartsService.heardALotArtists(userId);
  }

  @ApiOperation({summary: '최근에 들은 곡'})
  @Get('/last/song')
  async lastSongs(): Promise<object> {
    return await this.chartsService.lastSongs();
  }
}
