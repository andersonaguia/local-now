import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

function registerDto(password: string): RegisterDto {
  return plainToInstance(RegisterDto, {
    email: 'user@example.com',
    password,
  });
}

async function passwordMessages(password: string): Promise<string[]> {
  const errors = await validate(registerDto(password));
  const passwordError = errors.find((error) => error.property === 'password');

  return Object.values(passwordError?.constraints ?? {});
}

describe('RegisterDto', () => {
  it('should be able to accept a password with uppercase, number and special character', async () => {
    await expect(validate(registerDto('12Aa543!'))).resolves.toEqual([]);
  });

  it('should not be able to accept a password without an uppercase letter', async () => {
    await expect(passwordMessages('12aa543!')).resolves.toContain(
      'password must contain at least one uppercase letter',
    );
  });

  it('should not be able to accept a password without a number', async () => {
    await expect(passwordMessages('Aa!!!!!!')).resolves.toContain(
      'password must contain at least one number',
    );
  });

  it('should not be able to accept a password without a special character', async () => {
    await expect(passwordMessages('12Aa5432')).resolves.toContain(
      'password must contain at least one special character',
    );
  });
});
