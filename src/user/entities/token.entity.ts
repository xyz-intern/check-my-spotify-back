import { Playlist } from 'src/playlist/entities/playlist.entity';
import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
@Entity()
export class Token {
    @PrimaryColumn('varchar', {length: 255})
    userId: string;

    @Column()
    accessToken: string;

    @Column()
    refreshToken: string;

    @Column('boolean', {default: false})
    refreshToken_expiration: boolean;

    @OneToMany(type => Playlist, playlist => playlist.token)
    playlist: Playlist[];
}
