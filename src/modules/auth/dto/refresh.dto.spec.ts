import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RefreshDto } from './refresh.dto';

describe('RefreshDto', () => {
  it('should be able to accept a refresh token', async () => {
    await expect(
      validate(plainToInstance(RefreshDto, { refreshToken: 'refresh-token' })),
    ).resolves.toEqual([]);
  });

  it('should not be able to accept an empty refresh token', async () => {
    const errors = await validate(
      plainToInstance(RefreshDto, { refreshToken: '' }),
    );

    expect(errors.some((error) => error.property === 'refreshToken')).toBe(
      true,
    );
  });
});
