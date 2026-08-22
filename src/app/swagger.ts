import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
  SwaggerModule.setup('docs', app, document);
}
