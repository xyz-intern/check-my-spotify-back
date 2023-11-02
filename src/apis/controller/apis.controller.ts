import { Controller, Get, Param, Delete, Req, Session, Post, Body } from '@nestjs/common';
import { ApisService } from '../service/apis.service';

@Controller("apis")
export class ApisController {
  constructor(private readonly apisService: ApisService) {}
  @Get('/getTrack/:userId')
  async getTrack(@Param('userId') userId: string): Promise<string> {
    const duration_ms = await this.apisService.getPlayingTrack(userId);
    console.log("duration_ms", duration_ms);
    return duration_ms;
  }

  @Get('/command/:commandId')
  async command(@Param("commandId") commandId: string): Promise<string>{
    console.log(commandId)
    const response = await this.apisService.executeCommand(commandId);
    return response;
  }
}

