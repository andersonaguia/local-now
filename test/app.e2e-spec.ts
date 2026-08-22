import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app/app.module';
import { setupSwagger } from './../src/app/swagger';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupSwagger(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be able to render the home page', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect((res) => {
        expect(res.text).toContain('Local Now Server');
        expect(res.text).toContain('NestJS');
        expect(res.text).toMatch(/\d{2}\/\d{2}\/\d{4}/);
        expect(res.text).toMatch(/\d{2}:\d{2}:\d{2}/);
        expect(res.text).toContain('Cidade');
        expect(res.text).toContain('Temperatura');
        expect(res.text).toContain('Sensação térmica');
      });
  });

  it('should be able to return the current time', () => {
    return request(app.getHttpServer())
      .get('/time')
      .expect(200)
      .expect((res) => {
        expect(res.body.unix).toEqual(expect.any(Number));
        expect(res.body.tz).toBe(-3 * 3600);
        expect(res.body.date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
        expect(res.body.weekday).toMatch(/^(DOM|SEG|TER|QUA|QUI|SEX|SAB)$/);
      });
  });

  it('should be able to return the client geolocation', () => {
    return request(app.getHttpServer())
      .get('/geo')
      .expect(200)
      .expect((res) => {
        expect(res.body.ip).toEqual(expect.any(String));
        expect(res.body.country).toEqual(expect.any(String));
        expect(res.body.countryCode).toEqual(expect.any(String));
        expect(res.body).toEqual(
          expect.objectContaining({
            city: expect.any(String),
            region: expect.any(String),
            timezone: expect.any(String),
          }),
        );
      });
  });

  it('should be able to return the current weather', () => {
    return request(app.getHttpServer())
      .get('/weather')
      .expect(200)
      .expect((res) => {
        expect(res.body.temperature).toEqual(expect.any(Number));
        expect(res.body.humidity).toEqual(expect.any(Number));
        expect(res.body.latitude).toEqual(expect.any(Number));
        expect(res.body.longitude).toEqual(expect.any(Number));
        expect(res.body).toEqual(
          expect.objectContaining({
            ip: expect.any(String),
            city: expect.any(String),
            description: expect.any(String),
            timezone: expect.any(String),
          }),
        );
      });
  });

  it('should be able to expose swagger paths', () => {
    return request(app.getHttpServer())
      .get('/docs-json')
      .expect(200)
      .expect((res) => {
        expect(res.body.paths).toHaveProperty('/time');
        expect(res.body.paths).toHaveProperty('/geo');
        expect(res.body.paths).toHaveProperty('/weather');
        expect(res.body.paths).toHaveProperty('/auth/register');
        expect(res.body.paths).toHaveProperty('/auth/login');
        expect(res.body.paths).toHaveProperty('/auth/refresh');
      });
  });

  it('should not be able to register with an invalid payload', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-an-email', password: '123' })
      .expect(400);
  });

  it('should not be able to register with a weak password', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user@example.com', password: '12aa543!' })
      .expect(400);
  });

  it('should not be able to login with an invalid payload', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email', password: '' })
      .expect(400);
  });

  it('should not be able to refresh with an invalid payload', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: '' })
      .expect(400);
  });

  it('should not be able to exceed 10 requests per second', async () => {
    const server = app.getHttpServer();

    for (let i = 0; i < 10; i++) {
      await request(server).get('/time').expect(200);
    }

    await request(server)
      .get('/time')
      .expect(429)
      .expect((res) => {
        expect(res.body.message).toBe('Too Many Requests');
      });
  });
});
