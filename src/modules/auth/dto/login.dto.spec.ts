import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

function loginDto(data: { email?: string; password?: string }): LoginDto {
  return plainToInstance(LoginDto, data);
}

describe('LoginDto', () => {
  it('should be able to accept a valid email and password', async () => {
    await expect(
      validate(loginDto({ email: 'User@Example.com ', password: '12Aa543!' })),
    ).resolves.toEqual([]);
  });

  it('should not be able to accept an invalid email', async () => {
    const errors = await validate(
      loginDto({ email: 'not-an-email', password: '12Aa543!' }),
    );

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('should not be able to accept an empty password', async () => {
    const errors = await validate(
      loginDto({ email: 'user@example.com', password: '' }),
    );

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});
