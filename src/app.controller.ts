import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response, query } from 'express';
import { AppService } from './app.service';
import * as querystring from 'querystring';
import { stat } from 'fs';
const request = require('request');


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
    console.log('state', state)
    console.log('code', code)

    if (!state) {
      return res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    }
    return await this.appService.getAuthorizationCode(state, code);
  }

  @Get('/refresh_token')
  async refreshToken(@Req() req: Request, @Res() res: Response){
    const refreshToken = req.query.refresh_token;

    if(refreshToken){
      // return await this.appService.getAccessToken(refreshToken);
    }
  }
}