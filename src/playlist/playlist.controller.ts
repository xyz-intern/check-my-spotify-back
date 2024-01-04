import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandDto } from './dto/request/command.dto';
import { VolumnDto } from './dto/request/volume.dto';
import { TrackDto } from './dto/request/track.dto';
import * as METHOD from '../common/constants/method.url'

@Controller("apis")
@ApiTags('Playlist')
export class PlaylistController {
  constructor(private readonly PlaylistService: PlaylistService) { }
  @ApiOperation({summary: '현재 트랙 정보 가져오기'})
  @Get(`${METHOD.URL.getTrack}`)
  async getTrack(@Param() trackDto: TrackDto): Promise<string | number> {
    return await this.PlaylistService.getPlayingTrack(trackDto);
  }

  @ApiOperation({summary: '노래 재생/멈춤/다음/이전'})
  @ApiBody({schema: { properties: {command: {type: 'string'}, userId: {type: 'string'}}}})
  @Post(`${METHOD.URL.command}`)
  async command(@Body() commandDto: CommandDto): Promise<string > { 
    return await this.PlaylistService.executeCommand(commandDto);
  }

  @ApiOperation({summary: '볼륨 조절'})
  @Post(`${METHOD.URL.volume}`)
  @ApiBody({schema: { properties: {volume: {type: 'boolean'}, userId: {type: 'string'}}}})
  async setVolumn(@Body() volumnDto: VolumnDto){
    return await this.PlaylistService.setVolumePersent(volumnDto);
  }
}