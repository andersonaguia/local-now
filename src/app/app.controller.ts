import { Controller, Get, Header } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { HOME_PAGE } from './home.page';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  home(): string {
    return HOME_PAGE;
  }
}
