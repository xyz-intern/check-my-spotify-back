import { Token } from "src/user/entities/token.entity";
import { Playlist } from "../entities/playlist.entity";

export class Music {
    current_ms: string;
    duration_ms: number;
    device: string;
    artistName: string;
    user: Token;
    duplication: Playlist;
    data: any;
}