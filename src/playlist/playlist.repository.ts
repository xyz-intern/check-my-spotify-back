import { Repository } from "typeorm";
import { Playlist } from "../playlist/entities/playlist.entity";
import { CustomRepository } from "../user/custom.repository";
@CustomRepository(Playlist)
export class playlistRepository extends Repository<Playlist> {
}
