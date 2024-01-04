import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChartsService } from './charts.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import * as METHOD from '../common/constants/method.url';
import { FavoriteDto } from './dto/request/favorite.dto';

@Controller()
@ApiTags('Chart')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @ApiOperation({summary: '글로벌 TOP 50'})
  @Get(`${METHOD.URL.topSong}`)
  async topSongs(): Promise<Object>{
    return await this.chartsService.topSongs();
  }

  @ApiOperation({summary: 'TOP 아티스트'})
  @Get(`${METHOD.URL.topArtist}`)
  async topArtists(): Promise<object> {
    return await this.chartsService.topArtists();
  }

  @ApiOperation({summary: '가장 많이 들은 노래'})
  @Get(`${METHOD.URL.favoriteSong}`)
  async favoriteSongs(): Promise<object> {
    return await this.chartsService.lastSongs();
  }

  @ApiOperation({summary: '가장 많이 들은 아티스트'})
  @Post(`${METHOD.URL.favoriteArtist}`)
  async lovitArtists(@Body() favoriteDto: FavoriteDto): Promise<object> {
    return await this.chartsService.heardALotArtists(favoriteDto);
  }

  @ApiOperation({summary: '최근에 들은 곡'})
  @Get(`${METHOD.URL.lastSong}`)
  async lastSongs(): Promise<object> {
    return await this.chartsService.lastSongs();
  }
}
