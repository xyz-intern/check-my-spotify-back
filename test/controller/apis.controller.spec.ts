import { Test, TestingModule } from '@nestjs/testing';
import { ApisController } from '../../src/apis/controller/apis.controller';
import { ApisService } from '../../src/apis/service/apis.service';

describe('ApisController', () => {
  let controller: ApisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApisController],
      providers: [ApisService],
    }).compile();

    controller = module.get<ApisController>(ApisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
