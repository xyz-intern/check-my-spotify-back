import { Controller, Get, Param, Post, Req, Res, Session, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from './user.service';
import * as querystring from 'querystring';
import { MySession } from './interface/session.interface';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { TokenDto } from './dto/token.dto';

@Controller()
export class UserController {
  userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @ApiOperation({summary: '토큰 발급'})
  @Get('/callback')
  async callback(@Req() req: Request, @Res() res: Response, @Session() session: MySession): Promise<any> {
    const state = req.query.state || null;
    const code = req.query.code || null;

    if (!state) return res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    const token = await this.userService.getAuthorizationCode(code, session);

    if (token) {
      res.cookie('refreshToken', token.refreshToken, {
        path: '/',
        domain: 'localhost',
        httpOnly: false,
        secure: true,
        sameSite: 'none',
      });

      res.cookie('userId', token.userId, {
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

  @ApiOperation({summary: '액세스 토큰 재발급'})
  @Post("/reissue")
  @ApiBody({schema: { properties: {userId: {type: 'string'}, refreshToken: {type: 'string'}}}})
  async getReAccessToken(@Body() tokenDto: TokenDto): Promise<string> {
    console.log('tokenDto', tokenDto);
    return await this.userService.getReAccessToken(tokenDto);
  }
}

