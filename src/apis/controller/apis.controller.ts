import { Controller, Get, Param, Delete, Req, Session, Post, Body } from '@nestjs/common';
import { Request}  from 'express';
import { ApisService } from '../service/apis.service';
import { MySession } from '../interface/session.interface';
import { Cookie } from 'express-session';

@Controller("apis")
export class ApisController {
  constructor(private readonly apisService: ApisService) {}
  @Get('/getTrack/:userId')
  async getTrack(@Param('userId') userId: string): Promise<string> {
    const duration_ms = await this.apisService.getPlayingTrack(userId);
    return duration_ms;
  }

  @Get('/command/:commandId')
  async command(@Param("commandId") commandId: string, @Session() session: MySession): Promise<string>{
    const response = await this.apisService.executeCommand(commandId, session);
    return response;
  }
}

