import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './apis/entities/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    private httpService: HttpService,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>
  ) { }


  async getAuthorizationCode(state: Object, code: Object): Promise<void> {
    // AccessToken & RefreshToken 요청하기
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        // Front에서 받아온 인가코드
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
      // HttpModule Post 요청
      const response = await this.httpService.post(authOptions.url, authOptions.form, { headers: authOptions.headers }).toPromise();
      console.log(JSON.stringify(response.data))
      const access_token = JSON.stringify(response.data.access_token).replace(/"/g, '');
      const refresh_token = JSON.stringify(response.data.refresh_token).replace(/"/g, '');
      const userName = await this.getUserProfile(access_token);

      const token = this.tokenRepository.create({
        userId: userName,
        refreshToken: refresh_token,
        accessToken: access_token,
      })

      // Token database 저장
      this.tokenRepository.save(token);

      // const acessToken_reissue = await this.getReAccessToken(refresh_token);
      // console.log(acessToken_reissue)

    } catch (error) {
      console.error(error);
    }

  }

  async getUserProfile(accessToken: string): Promise<string> {
    // get Current User's Profile
    const authOptions = {
      'url': 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      json: true
    };

    try {
      const response = await this.httpService.get(authOptions.url, { headers: authOptions.headers }).toPromise();
      // console.log('user', JSON.stringify(response.data));
      const display_name = JSON.stringify(response.data.display_name).replace(/"/g, '');
      return display_name;
    } catch (error) {
      throw new Error('Failed to get user profile from Spotify API.');
    }
  }

  async getReAccessToken(refresh_token: string): Promise<Object> {
    // AccessToken 재발급
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        'grant_type': 'refresh_token',
        // 사용자가 이전에 받았던 refresh_token
        'refresh_token': refresh_token
      },
      json: true
    };

    try {
      const reissue = await this.httpService.post(authOptions.url, authOptions.form, { headers: authOptions.headers }).toPromise();
      console.log(JSON.stringify(reissue.data));
      return reissue;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get user profile from Spotify API.');
    }
  }

}