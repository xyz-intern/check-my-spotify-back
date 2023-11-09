export class PlaylistDto {
    constructor(
        public ref_userId: string = '', 
        public albumName: string = '', 
        public artistName: string = '',
        public songName: string = '', 
        public imageUri: string = '', 
        public deviceId: string = '',
        public count: number = 0){ }
}
