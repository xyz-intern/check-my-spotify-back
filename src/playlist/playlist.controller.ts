import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { PlaylistService } from './playlist.service';

@Controller("apis")
export class PlaylistController {
  constructor(private readonly PlaylistService: PlaylistService) { }
  @Get('/getTrack/:user_id')
  async getTrack(@Param('user_id') user_id: string): Promise<Object> {
    return await this.PlaylistService.getPlayingTrack(user_id);
  }

  @Post('/command')
  async command(@Body("command") command: string, @Body("user_id") user_id: string): Promise<object | string> {
    return await this.PlaylistService.executeCommand(command, user_id);
  }

  @Get('/favorite/song')
  async favoriteSongs(): Promise<object> {
    return await this.PlaylistService.favoriteSongs();
  }

  @Get('/heard/artists')
  async lovitArtists(): Promise<object> {
    return await this.PlaylistService.heardALotArtists();
  }

  @Get('/last/song')
  async lastSongs(): Promise<object> {
    return await this.PlaylistService.lastSongs();
  }
}