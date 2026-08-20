import { Test, TestingModule } from '@nestjs/testing';
import { TimeController } from './time.controller';
import { TimeService } from './time.service';

describe('TimeController', () => {
  let timeController: TimeController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TimeController],
      providers: [TimeService],
    }).compile();

    timeController = app.get<TimeController>(TimeController);
  });

  describe('time', () => {
    it('returns unix time for the ESP clock', () => {
      const result = timeController.getTime();
      expect(result.unix).toEqual(expect.any(Number));
      expect(result.tz).toBe(-3 * 3600);
      expect(result.date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(result.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(result.weekday).toMatch(/^(DOM|SEG|TER|QUA|QUI|SEX|SAB)$/);
    });
  });
});
