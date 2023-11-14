import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { ApiBody, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { CommandDto } from './dto/command.dto';

@Controller("apis")
export class PlaylistController {
  constructor(private readonly PlaylistService: PlaylistService) { }
  @ApiOperation({summary: '현재 트랙 정보 가져오기'})
  @Get('/getTrack/:user_id')
  async getTrack(@Param('user_id') user_id: string): Promise<Object> {
    return await this.PlaylistService.getPlayingTrack(user_id);
  }

  @ApiOperation({summary: '노래 재생/멈춤/다음/이전'})
  @ApiBody({schema: { properties: {command: {type: 'string'}, user_id: {type: 'string'}}}})
  @Post('/command')
  async command(@Body() commandDto: CommandDto): Promise<object | string> {
    return await this.PlaylistService.executeCommand(commandDto);
  }

  @Get('/volumn/:volume_percent')
  async setVolumn(@Param('volume_percent') volume_percent: string){
    return await this.PlaylistService.setVolumnPersent(volume_percent);
  }

  @ApiOperation({summary: '가장 많이 들은 노래'})
  @Get('/favorite/song')
  async favoriteSongs(): Promise<object> {
    return await this.PlaylistService.favoriteSongs();
  }

  @ApiOperation({summary: '가장 많이 들은 아티스트'})
  @Get('/heard/artists')
  async lovitArtists(): Promise<object> {
    return await this.PlaylistService.heardALotArtists();
  }

  @ApiOperation({summary: '최근에 들은 곡'})
  @Get('/last/song')
  async lastSongs(): Promise<object> {
    return await this.PlaylistService.lastSongs();
  }
}