import { Module } from '@nestjs/common';
import { ZitadelAuthGuard } from './zitadel-auth.guard';

@Module({
  providers: [ZitadelAuthGuard],
  exports: [ZitadelAuthGuard],
})
export class AuthModule {}
