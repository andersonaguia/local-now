import { ExecutionContext } from '@nestjs/common';
import { skipThrottlerForDocs } from './throttler.config';

describe('skipThrottlerForDocs', () => {
  function contextWithPath(path: string | undefined): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ path }),
      }),
    } as ExecutionContext;
  }

  it('skips swagger docs routes', () => {
    expect(skipThrottlerForDocs(contextWithPath('/docs'))).toBe(true);
    expect(skipThrottlerForDocs(contextWithPath('/docs-json'))).toBe(true);
  });

  it('does not skip API routes', () => {
    expect(skipThrottlerForDocs(contextWithPath('/'))).toBe(false);
    expect(skipThrottlerForDocs(contextWithPath('/geo'))).toBe(false);
    expect(skipThrottlerForDocs(contextWithPath('/weather'))).toBe(false);
  });
});
