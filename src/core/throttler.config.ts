import { ExecutionContext } from '@nestjs/common';
import { seconds, ThrottlerModuleOptions } from '@nestjs/throttler';

export const RATE_LIMIT_PER_SECOND = 10;

export function skipThrottlerForDocs(context: ExecutionContext): boolean {
  const { path } = context.switchToHttp().getRequest<{ path?: string }>();
  return typeof path === 'string' && path.startsWith('/docs');
}

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      ttl: seconds(1),
      limit: RATE_LIMIT_PER_SECOND,
    },
  ],
  errorMessage: 'Too Many Requests',
  generateKey: (_context, tracker) => tracker,
  skipIf: skipThrottlerForDocs,
};
