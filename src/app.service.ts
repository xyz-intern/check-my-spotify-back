import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './apis/entities/token.entity';
import { Repository } from 'typeorm';
import { AxiosRequestConfig } from 'axios';
const {request} = require('request');
@Injectable()
export class AppService {
  constructor(
    private httpService: HttpService,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>
  ) {}

  async getAuthorizationCode(state: Object, code: Object) : Promise<void> {
      let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          'code': code,
          'redirect_uri': process.env.REDIRECT_URI,
          'grant_type': process.env.GRANT_TYPE,
        },
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        json: true
      };

      try {
        const response1 = await this.httpService.post(authOptions.url, authOptions.form, { headers: authOptions.headers }).toPromise();
        console.log(`response: ${JSON.stringify(response1.data.access_token)}`);
        const access_token = JSON.stringify(response1.data.access_token).replace(/"/g,'');
        this.getUserProfile(access_token);

        const token = this.tokenRepository.create({
          refreshToken : JSON.stringify(response1.data.refresh_token),
          accessToken: JSON.stringify(response1.data.access_token),
        })
        
        this.tokenRepository.save(token);
    
      } catch (error) {
        console.error(error);
      }

  }

  async getUserProfile(accessToken: string) {
    const userProfile = {
      'url' : 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      json: true
    };

    console.log(`Bearer ${accessToken}`)
    
    try {
      const response = await this.httpService.get(userProfile.url, {headers: userProfile.headers}).toPromise();
      console.log(response.data);
      return response.data;
      
    } catch (error) {
      console.error('Error:', error.response.data);
      throw new Error('Failed to get user profile from Spotify API.');
    }
  }

}