import { Controller, Get, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
// import queryString from 'query-string';
import * as querystring from 'querystring';
import { Request, Response, query } from 'express';
const request = require('request');

@Controller()
export class AppController {
  constructor(private httpService: HttpService) {}

  @Get('/callback')
  async callback(@Req() req: Request, @Res() res: Response) {

    // queryString에서 state, code 추출
    const state = req.query.state || null;
    const code = req.query.code || null;

    console.log('state     :    ' + state);
    console.log('code      :    ' + code);

    // state 값이 없다면
    if (state === null) { return res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));} 

    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': 'Basic ' + 
        // Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
        Buffer.from( 'client_id'+ ':' +'client_secret' ).toString('base64'),
      },
      form: {
        grant_type: 'client_credentials'
      },
      json: true
    };
    
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        let token = body.access_token;
        console.log('token   '+token);
      }
    });
  }
}