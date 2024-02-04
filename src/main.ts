import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { ValidationPipe } from "@nestjs/common";


async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// For validation of dto
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // remove non-defined properties from the requests body,
			forbidNonWhitelisted: true // return error when non-defined properties added to the request body
		})
	);

	await app.listen(process.env.PORT);
}
bootstrap();
