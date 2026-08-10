import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ZitadelAuthGuard } from '../auth/zitadel-auth.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import type { AuthenticatedRequestType } from '../auth/zitadel-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @UseGuards(ZitadelAuthGuard)
  @Get('me')
  getMe(@CurrentAuth() auth: AuthenticatedRequestType['auth']) {
    return {
      userId: auth.userId,
      orgId: auth.orgId,
    };
  }
}
