import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApisService } from './apis.service';
@Controller("apis")
export class ApisController {
  constructor(private readonly apisService: ApisService) {}

  @Get('/getTrack/:userId')
  async getTrack(@Param("userId") userId: string) {
    return await this.apisService.getPlayingTrack(userId);
  }

}
