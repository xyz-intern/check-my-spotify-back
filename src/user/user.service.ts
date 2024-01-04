import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { MyToken } from '../user/interface/token.interface';
import * as net from 'net';
import { TokenDto } from './dto/token.dto';
import * as REQUEST from '../common/constants/request.option'
import * as SPOTIFY from '../common/constants/spotify.url';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) { }

  // AccessToken & RefreshToken 요청하기
  async  getAuthorizationCode(code: Object): Promise<MyToken> {
    try {
      const authOptions = await this.setRequestOptions(REQUEST.OPTIONS.TOKEN, code)
      const response = await axios.post(SPOTIFY.URL.GET_TOKEN, authOptions.form, { headers: authOptions.headers });
      const access_token = response.data.access_token.replace(/"/g, '');
      const refresh_token = response.data.refresh_token.replace(/"/g, '');
      const userName = await this.getUserProfile(access_token);

      if (response.data) this.sendSocketData(userName);

      const token = this.tokenRepository.create({
        userId: userName,
        refreshToken: refresh_token,
        accessToken: access_token,
      });

      await this.tokenRepository.save(token);
      return token;
    } catch (error) {
      console.log(error)
    }
  }

  // 로그인 시 유저 정보 가져오기
  async getUserProfile(access_token: string): Promise<string> {
    try {
    const headers = {
      'Authorization': 'Bearer ' + access_token
    }
      const response = await axios.get(SPOTIFY.URL.GET_USER_PROFILE, { headers: headers });
      return JSON.stringify(response.data.display_name).replace(/"/g, '');
    } catch (error) {
      console.log(error)
    }
  }

  // AccessToken 재발급
  async getReAccessToken(tokenDto: TokenDto): Promise<string> {
    try {
      const authOptions = await this.setRequestOptions(REQUEST.OPTIONS.RETOKEN, tokenDto);
      const response = await axios.post(SPOTIFY.URL.GET_TOKEN, authOptions.form, { headers: authOptions.headers });
      const user = await this.tokenRepository.findOne({ where: { userId: tokenDto.userId } });

      const updateToken = {
        ...user,
        accessToken: response.data.access_token
      }

      const sucess = await this.tokenRepository.update(user.userId, updateToken)
      if (sucess) return "액세스 토큰이 재발급 되었습니다.";
    } catch (error) {
      console.log(error)
    }
  }

  async setRequestOptions(type: string, data: any) {
    const headers = {
      Authorization:
        'Basic ' +
        Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    switch (type) {
      case REQUEST.OPTIONS.TOKEN:
        return {
          headers: { ...headers },
          form: {
            'code': data, // Front에서 받은 인가코드
            'redirect_uri': process.env.REDIRECT_URI,
            'grant_type': process.env.GRANT_TYPE,
          },
          json: true
        }
      case REQUEST.OPTIONS.RETOKEN:
        return {
          headers: { ...headers },
          form: {
            'grant_type': 'refresh_token',
            'refresh_token': data.refreshToken
          },
          json: true
        }
    }
  }

  // Python Script와 WebSocket 통신
  async sendSocketData(data: string, data2?: string) {
    const client = new net.Socket;
    let time = data
    if (data2) time = data + "|" + data2
    client.connect(+process.env.SERVER_PORT, process.env.SERVER_IP, function () {
      console.log("Connected to the server")
      client.write(time)
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
}
