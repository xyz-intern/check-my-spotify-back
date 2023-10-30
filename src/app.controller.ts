import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import * as querystring from 'querystring';

@Controller()
export class AppController {
  appService: AppService;

  constructor(appService: AppService) {
    this.appService = appService;
  }

  @Get('/callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    const state = req.query.state || null;
    const code = req.query.code || null;

    if (!state) {
      return res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    }
    return await this.appService.getAuthorizationCode(state, code);
  }

}