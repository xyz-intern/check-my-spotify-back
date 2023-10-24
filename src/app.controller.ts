import { Controller, Get, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
// import queryString from 'query-string';
import * as querystring from 'querystring';
import { Request, Response, query } from 'express';
const request = require('request');

@Controller()
export class AppController {
  constructor(private httpService: HttpService) { }

  @Get('/callback')
  async callback(@Req() req: Request, @Res() res: Response) {

    // queryString에서 state, code 추출
    const state = req.query.state || null;
    const code = req.query.code || null;

    // state 값이 없다면
    if (state === null) {
      return res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    } else {

      // Access Token 요청
      let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          'code': code,
          'redirect_uri': process.env.REDIRECT_URI,
          'grant_type': process.env.GRANT_TYPE,
        },
        // Base62 Encoding
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        json: true
      };

      try {
        const response = await this.httpService.post(authOptions.url, authOptions.form, { headers: authOptions.headers }).toPromise();
        console.log(`response: ${JSON.stringify(response.data)}`);
      } catch (error) {
        console.error(error);
      }
    }

  }
}