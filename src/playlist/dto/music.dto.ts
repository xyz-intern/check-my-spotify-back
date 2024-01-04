import { Token } from "src/user/entities/token.entity";
import { Playlist } from "../entities/playlist.entity";
import { Artist } from "../entities/artist.entity";

export class Music {
    current_ms: string;
    duration_ms: number;
    device: string;
    artistName: any;
    user: Token;
    duplication: any;
    data: any;
}