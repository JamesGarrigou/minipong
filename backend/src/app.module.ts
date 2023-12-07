import { Module } from '@nestjs/common';
import { PongModule } from './pong/pong.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
	imports: [
		PongModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'dist'),
		}),
	],
})
export class AppModule {}
