import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from '../entities/token.entity';
import { Repository } from 'typeorm';
import { Playlist } from '../entities/playlist.entity';
import { PlaylistDto } from '../dto/playlist.dto';
@Injectable()
export class ApisService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    // private apisService: ApisService
  ) { }

  async getPlayingTrack(userId: string): Promise<string> {
    const user = await this.tokenRepository.findOne({ where: { userId } })
    const url = "https://api.spotify.com/v1/me/player/currently-playing"
    const headers = {
      Authorization: 'Bearer ' + user.accessToken
    }

    try {
      const response = await axios.get(url, { headers });
      // 여러명의 아티스트 때 object로 저장
      let artists = response.data.item.artists;
      let singers = Object.values(artists);
      const device = await this.getDeviceId(user.accessToken);

      let results = [];

      // 다중 ArtistName 가져오기
      for (let i = 0; i < singers.length; i++) results[i] = singers[i]['name'];
      const albumName = response.data.item.album.name;
      const songName = response.data.item.name;
      const imageUri = response.data.item.album.images;
      const artistName = results.join(', ');
      const progress_ms = parseInt(response.data.progress_ms);
      const duration_ms = parseInt(response.data.item.duration_ms);
      const current_ms = String(duration_ms - progress_ms);

      // console.log("재생시간", Number(duration_ms)-Number(progress_ms))
      const saveTrackData = new PlaylistDto();

      // 같은 곡 Play
      const duplication = await this.playlistRepository.findOne({
        where: {songName: songName, artistName: artistName}
      })

      if(duplication){
        const updateInfo = {
          ...duplication,
          count: duplication.count + 1
        }

        this.playlistRepository.update(updateInfo.songId, updateInfo);
      }else{
        saveTrackData.userId = userId;
        saveTrackData.albumName = albumName;
        saveTrackData.artistName = artistName;
        saveTrackData.songName = songName;
        saveTrackData.imageUri = imageUri.find((image) => image.height === 640).url
        saveTrackData.deviceId = device;
        saveTrackData.count = 1;
  
        this.playlistRepository.save(saveTrackData);
        
        
      }
      return current_ms;
      
      
    } catch (error) {
      console.error(error);
    }
  }

  async getDeviceId(accessToken: string): Promise<string> {
    let authOptions = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
      json: true
    };

    try{
      const response = await axios.get(authOptions.url, { headers: authOptions.headers });
      const deviceId = response.data.devices[0].id;
      return deviceId;
    }catch(error){
      console.log(error);
    }
    
  }

  
  async executeCommand(commandId: string): Promise<string> {
    let success = "";
    const userId = "dlatldhs";
    const user = await this.tokenRepository.findOne({ where: {userId} })
    const deviceId = await this.getDeviceId(user.accessToken);

    let authOptions = {
      url: '',
      form: { 
        'device_id': deviceId
      },
      headers: {
        Authorization: 'Bearer ' + user.accessToken
      }
    };

    if(commandId == "play"){
      authOptions.url = "https://api.spotify.com/v1/me/player/play"
      success = await axios.put(authOptions.url, authOptions.form, {headers: authOptions.headers});
      // this.apisService.executeCommand(commandId)
      if(success) return "음악이 재생되었습니다";
    }
    else if(commandId == "stop"){
      authOptions.url = "https://api.spotify.com/v1/me/player/pause"
      success = await axios.put(authOptions.url, authOptions.form, {headers: authOptions.headers});

      if(success) return "음악이 정지되었습니다";
    }else if(commandId == "next"){
      authOptions.url = "https://api.spotify.com/v1/me/player/next"
      console.log(authOptions)
      success = await axios.post(authOptions.url, authOptions.form, {headers: authOptions.headers});
      if(success) return "다음곡으로 전환하였습니다";
    }else if(commandId == "previous"){
      authOptions.url = "https://api.spotify.com/v1/me/player/previous"
      success = await axios.post(authOptions.url, authOptions.form, {headers: authOptions.headers});
      if(success) return "이전곡으로 전환하였습니다";
    } 
}
}