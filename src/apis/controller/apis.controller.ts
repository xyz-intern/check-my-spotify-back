import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApisService } from '../service/apis.service';

@Controller("apis")
export class ApisController {
  constructor(private readonly apisService: ApisService) { }
  @Get('/getTrack/:user_id')
  async getTrack(@Param('user_id') user_id: string): Promise<Object> {
    return await this.apisService.getPlayingTrack(user_id);
  }

  @Post('/command')
  async command(@Body("command") command: string, @Body("user_id") user_id: string): Promise<object | string> {
    return await this.apisService.executeCommand(command, user_id);
  }
}
