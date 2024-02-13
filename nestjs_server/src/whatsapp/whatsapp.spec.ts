import { Test, TestingModule } from '@nestjs/testing';
import { Whatsapp } from './whatsapp';

describe('Whatsapp', () => {
  let provider: Whatsapp;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Whatsapp],
    }).compile();

    provider = module.get<Whatsapp>(Whatsapp);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
