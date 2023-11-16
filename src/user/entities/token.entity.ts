import { ApiProperty } from '@nestjs/swagger';
import { Playlist } from 'src/playlist/entities/playlist.entity';
import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
@Entity()
export class Token {
    @PrimaryColumn('varchar', {length: 255})
    @ApiProperty()
    userId: string;

    @Column()
    @ApiProperty()
    accessToken: string;

    @Column()
    @ApiProperty()
    refreshToken: string;

    @Column('boolean', {default: false})
    @ApiProperty()
    refreshToken_expiration: boolean;

    @OneToMany(type => Playlist, playlist => playlist.token)
    @ApiProperty()
    playlist: Playlist[];
}