import { Module } from '@nestjs/common';
import { EventsGateway } from '../socket/event.gateway';


@Module({
  providers: [EventsGateway],
})
export class EventsModule {}