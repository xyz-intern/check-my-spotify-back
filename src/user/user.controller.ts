import { Controller, Get, Post, Req, Res, Session, Body, Param, Delete } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from './user.service';
import * as querystring from 'querystring';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TokenDto } from './dto/token.dto';
import { PlaylistService } from 'src/playlist/playlist.service';

@Controller()
@ApiTags('User')
export class UserController {
  userService: UserService;
  playlistService: PlaylistService;

  constructor(userService: UserService, playlistService: PlaylistService) {
    this.playlistService = playlistService
    this.userService = userService;
  }

  @ApiOperation({summary: '토큰 발급'})
  @Get('/callback')
  async callback(@Req() req: Request, @Res() res: Response): Promise<any> {
    const state = req.query.state || null;
    const code = req.query.code || null;

    if (!state) return res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    const token = await this.userService.getAuthorizationCode(code);

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
    console.log("액세스 토큰 제발~~~~~~~~~~~~급!")
    return await this.userService.getReAccessToken(tokenDto);
  }


  @ApiOperation({summary: '사용자 로그아웃'})
  @Delete('/logout/:userId')
  async logout(@Param("userId") userId: string): Promise<string>{
    return await this.playlistService.afterTokenExpiration(userId);
  }
}

