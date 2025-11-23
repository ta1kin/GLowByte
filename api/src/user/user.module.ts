import { Module } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { LoggerModule } from '../common/logger/logger.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
	imports: [PrismaModule, LoggerModule],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
