import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Playlist {
    @PrimaryGeneratedColumn()
    songId: number;
    @Column()
    userId: string;
    @Column()
    artistName: string;
    @Column()
    songName: string;
    @Column()
    imageUri: string;
    @Column()
    albumName: string;
    @Column()
    deviceId: string;
}