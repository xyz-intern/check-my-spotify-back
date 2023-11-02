import { Controller, Get, Req, Res, Session } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from '../service/app.service';
import * as querystring from 'querystring';
import { MySession } from '../interface/session.interface';
@Controller()
export class AppController {
  appService: AppService;

  constructor(appService: AppService) {
    this.appService = appService;
  }


  @Get('/callback')
  async callback(@Req() req: Request, @Res() res: Response, @Session() session: MySession): Promise<any> {
    const state = req.query.state || null;
    const code = req.query.code || null;

    if (!state) {
      return res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    }
    const token = await this.appService.getAuthorizationCode(code, session);

    res.cookie('userId', token, {
      path: '/',
      domain: 'localhost',
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    });

    return res.send({
      "message": "쿠키가 생성되었습니다."
    })

  }
}

