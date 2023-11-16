import { ApiProperty } from "@nestjs/swagger";

export class ChartEntity{
    @ApiProperty()
    public rank: string;
    
    @ApiProperty()
    public artists: string;
    
    @ApiProperty()
    public trackName: string;
}