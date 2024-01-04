import { Repository } from "typeorm";
import { Playlist } from "../playlist/entities/playlist.entity";
import { CustomRepository } from "../user/custom.repository";
import { Artist } from "./entities/artist.entity";
@CustomRepository(Artist)
export class ArtistRepository extends Repository<Artist> {
}