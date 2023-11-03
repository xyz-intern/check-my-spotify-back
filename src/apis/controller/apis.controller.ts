import { Controller, Get, Param, Delete, Req, Session, Post, Body } from '@nestjs/common';
import { ApisService } from '../service/apis.service';

@Controller("apis")
export class ApisController {
  constructor(private readonly apisService: ApisService) {}
  @Get('/getTrack/:user_id')
  async getTrack(@Param('user_id') user_id: string): Promise<string> {
    const duration_ms = await this.apisService.getPlayingTrack(user_id);
    console.log("duration_ms", duration_ms);
    return duration_ms;
  }

  @Post('/command')
  async command(@Body("command") command: string, @Body("user_id") user_id: string): Promise<string>{
    console.log(command, user_id)
    const response = await this.apisService.executeCommand(command, user_id);
    return response;
  }
}

