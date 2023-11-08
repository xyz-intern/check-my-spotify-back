import { Body, Controller, Get, Param, Req, Res, Session } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from './user.service';
import * as querystring from 'querystring';
import { MySession } from '../common/interface/session.interface';

@Controller()
export class UserController {
  userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Get('/callback')
  async callback(@Req() req: Request, @Res() res: Response, @Session() session: MySession): Promise<any> {
    const state = req.query.state || null;
    const code = req.query.code || null;

    if (!state) return res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    const token = await this.userService.getAuthorizationCode(code, session);

    if (token) {
      res.cookie('refreshToken', token.refresh_token, {
        path: '/',
        domain: 'localhost',
        httpOnly: false,
        secure: true,
        sameSite: 'none',
      });
    }
    return res.send({
      "message": "쿠키가 생성되었습니다."
    })

  }

  @Get("/reissue/:refreshToken")
  async getReAccessToken(@Param("refreshToken") refreshToken: string): Promise<string> {
    const reissue = await this.userService.getReAccessToken(refreshToken);
    return reissue;
  }
}