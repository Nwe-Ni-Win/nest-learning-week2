import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { PostsService } from './posts/posts.service';
import { PostsModule } from './posts/posts.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';

@Module({
  imports: [PrismaModule, UsersModule, PostsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, UsersService, PostsService, AuthService],
})
export class AppModule {}
