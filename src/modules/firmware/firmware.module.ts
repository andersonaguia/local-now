import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FirmwareController } from './firmware.controller';
import { FirmwareService } from './firmware.service';
import { GithubReleasesService } from './github-releases.service';

@Module({
  imports: [AuthModule],
  controllers: [FirmwareController],
  providers: [FirmwareService, GithubReleasesService],
})
export class FirmwareModule {}
