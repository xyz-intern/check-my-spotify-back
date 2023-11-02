import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,

} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway(8765)
export class EventsGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('events')
    onEvent(client: any, data: any) {
        return { event: 'events', data: 'test' }
    }
  }
