import { HttpStatus, Injectable, UnauthorizedException, UseFilters } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from '../entities/token.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { MySession } from '../interface/session.interface';
import { MyToken } from '../interface/token.interface';
import { CustomException } from 'src/common/exception/custom.exception';
import { config } from 'process';
const net = require('net')

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>
  ) { }

  // AccessToken & RefreshToken 요청하기
  async getAuthorizationCode(code: Object, session: MySession): Promise<MyToken> {
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        'code': code, // Front에서 받은 인가코드
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

    this.AxiosErrorinterceptor();

    try {
      const response = await axios.post(authOptions.url, authOptions.form, { headers: authOptions.headers });
      const data = JSON.stringify(response.data);
      const access_token = JSON.stringify(response.data.access_token).replace(/"/g, '');
      const refresh_token = JSON.stringify(response.data.refresh_token).replace(/"/g, '');
      const userName = await this.getUserProfile(access_token);

      session.userName = userName;

      if (data) this.sendSocketData(session.userName);

      const token = this.tokenRepository.create({
        userId: userName,
        refreshToken: refresh_token,
        accessToken: access_token,
      });

      await this.tokenRepository.save(token);
      return JSON.parse(data);
    } catch (error) {
      console.log(error);
    }
  }

  // 로그인 시 유저 정보 가져오기
  async getUserProfile(accessToken: string): Promise<string> {
    // get Current User's Profile
    const authOptions = {
      'url': 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      json: true
    };

    this.AxiosErrorinterceptor();

    try {
      const response = await axios.get(authOptions.url, { headers: authOptions.headers });
      const display_name = JSON.stringify(response.data.display_name).replace(/"/g, '');
      return display_name;
    } catch (error) {
      console.log(error);
    }
  }

  // AccessToken 재발급
  async getReAccessToken(refresh_token: string): Promise<Object> {
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

    this.AxiosErrorinterceptor();

    try {
      return await axios.post(authOptions.url, authOptions.form, { headers: authOptions.headers });
    } catch (error) {
      console.error(error);
    }
  }

  // Python Script와 WebSocket 통신
  async sendSocketData(data: string) {
    const client = new net.Socket;

    client.connect(process.env.SERVER_PORT, process.env.SERVER_IP, function () {
      console.log("Connected to the server")
      client.write(data)
    })
    client.on('data', function (data) {
      console.log("Received from the server data : " + data)
    })

    client.on('close', function () {
      console.log('Connection closed')
    })
  }

  async AxiosErrorinterceptor() {
    axios.interceptors.response.use(
      (response) => { return response; },
      (error) => {
        if (error.response && error.response.status === 400) {
          throw new CustomException("잘못된 요청입니다", 400);
        }
        else if (error.response.status === 401) {
          throw new CustomException("토큰이 만료되었습니다", 401);
        }
        throw error;
      }
    );
  }
}