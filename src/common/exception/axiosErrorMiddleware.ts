import axios from "axios";
import { CustomException } from "./custom.exception";

export function axiosErrorMiddleware(service) {
  return async (req, res, next) => {
    const userId = req.cookies.userId;
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response.status === 404) {
          throw new CustomException("연결된 기기가 없습니다.", 404);
        } else if (error.response.status === 401) {
          await service.afterTokenExpiration(userId);
          throw new CustomException("다시 로그인해주세요", 401);
        } else if (error.response.status === 204) {
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