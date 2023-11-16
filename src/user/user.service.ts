import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { MySession } from './interface/session.interface';
import { MyToken } from '../user/interface/token.interface';
import { CustomException } from '../common/exception/custom.exception';
import * as net from 'net';
import { TokenDto } from './dto/token.dto';
import * as SPOTIFY from '../common/constants/spotify.url';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>
  ) { }

  // AccessToken & RefreshToken 요청하기
  async getAuthorizationCode(code: Object, session: MySession): Promise<MyToken> {
    let authOptions = {
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
      const response = await axios.post(SPOTIFY.URL.GET_TOKEN, authOptions.form, { headers: authOptions.headers });
      const data = response.data;
      const access_token = response.data.access_token.replace(/"/g, '');
      const refresh_token = response.data.refresh_token.replace(/"/g, '');
      const userName = await this.getUserProfile(access_token);

      session.userName = userName;

      if (data) this.sendSocketData(session.userName);

      const token = this.tokenRepository.create({
        userId: userName,
        refreshToken: refresh_token,
        accessToken: access_token,
      });

      await this.tokenRepository.save(token);
      return token;
    } catch (error) {
      console.log(error);
    }
  }

  // 로그인 시 유저 정보 가져오기
  async getUserProfile(accessToken: string): Promise<string> {
    const authOptions = {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      json: true
    };

    this.AxiosErrorinterceptor();

    try {
      const response = await axios.get(SPOTIFY.URL.GET_USER_PROFILE, { headers: authOptions.headers });
      return JSON.stringify(response.data.display_name).replace(/"/g, '');
    } catch (error) {
      console.log(error);
    }
  }

  // AccessToken 재발급
  async getReAccessToken(tokenDto: TokenDto): Promise<string> {
    var authOptions = {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        'grant_type': 'refresh_token',
        'refresh_token': tokenDto.refreshToken
      },
      json: true
    };

    this.AxiosErrorinterceptor();

    try {
      const response = await axios.post(SPOTIFY.URL.GET_TOKEN, authOptions.form, { headers: authOptions.headers });
      const user = await this.tokenRepository.findOne({where: {userId: tokenDto.userId}});

      const updateToken = {
        ...user,
        accessToken: response.data.access_token
      }
      
      const sucess = await this.tokenRepository.update(user.userId, updateToken)
      if (sucess) return "액세스 토큰이 재발급 되었습니다.";
    } catch (error) {
      console.error(error);
    }
  }

  // Python Script와 WebSocket 통신
  async sendSocketData(data: string) {
    const client = new net.Socket;

    client.connect(+process.env.SERVER_PORT, process.env.SERVER_IP, function () {
      console.log("Connected to the server")
      client.write(data)
    })
    client.on('data', function (data) {
      console.log("Received from the server data : " + data)
    })

    client.on('close', function () {
      console.log('Connection closed')
    })

    client.on('error', (err) => {
      if (err.message.includes('ECONNREFUSED')) {
        console.log('Connection refused to the server. Please check your server status or IP address.');
      } else {
        console.log('An unexpected error occurred:', err.message);
      }
    });
  }

  // Exception Handler
  async AxiosErrorinterceptor() {
    axios.interceptors.response.use(
      (response) => { return response; },
      (error) => {
        if (error.response && error.response.status === 400) {
          throw new CustomException("잘못된 요청입니다", 400);
        }
        throw error;
      }
    );
  }
}