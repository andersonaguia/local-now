process.env.DATABASE_URL ??= 'file::memory:';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret';
process.env.JWT_ACCESS_EXPIRES_IN ??= '15m';
process.env.JWT_REFRESH_EXPIRES_IN ??= '7d';
process.env.GITHUB_TOKEN ??= 'test-github-token';
process.env.GITHUB_FW_REPO ??= 'andersonaguia/platformIO-releases';
