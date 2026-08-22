import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const SWAGGER_UI_DIST = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.32.13';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Time Server')
    .setDescription(
      'Horário, geolocalização e clima a partir do IP do cliente. Limite: 10 requisições por segundo por IP.',
    )
    .setVersion('0.0.1')
    .addBearerAuth()
    .addGlobalResponse({
      status: 429,
      description:
        'Too Many Requests — mais de 10 requisições por segundo no mesmo IP',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customCssUrl: `${SWAGGER_UI_DIST}/swagger-ui.css`,
    customJs: [
      `${SWAGGER_UI_DIST}/swagger-ui-bundle.js`,
      `${SWAGGER_UI_DIST}/swagger-ui-standalone-preset.js`,
    ],
    customfavIcon: `${SWAGGER_UI_DIST}/favicon-32x32.png`,
  });
}
