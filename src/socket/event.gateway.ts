import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,

} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

const socket = new WebSocket('ws://192.168.0.105:8765');

socket.addEventListener('open', () => {
  console.log('서버에 연결되었습니다.');

  // 서버로 데이터를 보내는 예시
  const data = { message: 'Hello, Server!' };
  socket.send(JSON.stringify(data));
});

socket.addEventListener('message', (event) => {
  console.log('서버로부터 메시지를 받았습니다:', event.data);
});

socket.addEventListener('close', () => {
  console.log('서버와의 연결이 종료되었습니다.');
});

@WebSocketGateway(8765)
export class EventsGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('events')
    onEvent(client: any, data: any) {
        return { event: 'events', data: 'test' }
    }
  }
