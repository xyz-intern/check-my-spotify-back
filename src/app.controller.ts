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

    console.log('state     :    ' + state);
    console.log('code      :    ' + code);

    // state 값이 없다면
    if (state === null) {
      return res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    } else {

      // Access Token 요청
      let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          'code': code,
          'redirect_uri': 'http://localhost:3000/callback',
          'grant_type': 'authorization_code',
        },
        // Base62 Encoding
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from("f7601b150dde4057a8d8df839792e18b" + ':' + "699904e4d8ed43ab8fe7e406756b2a28").toString('base64'),
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