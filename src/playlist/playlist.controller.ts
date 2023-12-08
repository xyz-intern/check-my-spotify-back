import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandDto } from './dto/command.dto';
import { VolumnDto } from './dto/volume.dto';

@Controller("apis")
@ApiTags('Playlist')
export class PlaylistController {
  constructor(private readonly PlaylistService: PlaylistService) { }
  @ApiOperation({summary: '현재 트랙 정보 가져오기'})
  @Get('/getTrack/:user_id')
  async getTrack(@Param('user_id') user_id: string): Promise<string | number> {
    return await this.PlaylistService.getPlayingTrack(user_id);
  }

  @ApiOperation({summary: '노래 재생/멈춤/다음/이전'})
  @ApiBody({schema: { properties: {command: {type: 'string'}, userId: {type: 'string'}}}})
  @Post('/command')
  async command(@Body() commandDto: CommandDto): Promise<string > { 
    return await this.PlaylistService.executeCommand(commandDto);
  }

  @ApiOperation({summary: '볼륨 조절'})
  @Post('/volume')
  @ApiBody({schema: { properties: {volume: {type: 'boolean'}, userId: {type: 'string'}}}})
  async setVolumn(@Body() volumnDto: VolumnDto){
    return await this.PlaylistService.setVolumePersent(volumnDto);
  }
}