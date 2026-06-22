import { Module, Global } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [
        KnexModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                config: {
                    client: 'pg',
                    connection: {
                        host: configService.get<string>('DB_HOST'),
                        port: configService.get<number>('DB_PORT'),
                        user: configService.get<string>('DB_USER'),
                        password: configService.get<string>('DB_PASS'),
                        database: configService.get<string>('DB_NAME'),
                    },
                },
            }),
        }),
    ],
})
export class DatabaseModule { }