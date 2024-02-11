import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { SetModule } from "../set/set.module";
import { WordModule } from "../word/word.module";
import { ServeStaticModule } from "@nestjs/serve-static";

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: "/avatars", // Directly use the absolute path
			serveRoot: "/avatars/"
		}),
		ServeStaticModule.forRoot({
			rootPath: "/wordsImages", // Directly use the absolute path
			serveRoot: "/wordsImages/"
		}),
		ConfigModule.forRoot({
			isGlobal: true
		}),
		TypeOrmModule.forRoot({
			type: "postgres",
			host: process.env.DATABASE_HOST,
			port: parseInt(process.env.DATABASE_PORT),
			username: process.env.DATABASE_USERNAME,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_NAME,
			autoLoadEntities: true,
			synchronize: true // set to false in production
		}),
		UserModule,
		AuthModule,
		SetModule,
		WordModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
