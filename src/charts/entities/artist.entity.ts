import { ApiProperty } from "@nestjs/swagger";

export class ArtistEntity{
    @ApiProperty()
    public rank: string;
    
    @ApiProperty()
    public artist: string;
}