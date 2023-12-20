import axios from "axios";
import { CustomException } from "./custom.exception";
import { PlaylistService } from "src/playlist/playlist.service";
import { Injectable } from "@nestjs/common";
import { error } from "console";

@Injectable()
export class AxiosErrorMiddleware {
  constructor(private readonly playlistService: PlaylistService) { }

  public interceptResponse = async (req, res, next) => {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { userId } = req.body;
        if (error.response.status === 404) {
          throw new CustomException("연결된 기기가 없습니다.", 404);
        } else if (error.response.status === 401) {
          await this.playlistService.afterTokenExpiration(userId);
          throw new CustomException("다시 로그인해주세요", 401);
        }
        else if (error.response.status === 204) {
          throw new CustomException("NO CONTENT", 204);
        } else if (error.response.status === 400) {
          throw new CustomException("잘못된 요청입니다.", 400);
        } else if (error.response.status === 500) {
          throw new CustomException("Internal Server Error", 500);
        }
        throw error;
      }
    );
    next();
  };
}