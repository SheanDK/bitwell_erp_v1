import { ConfigModule } from '@nestjs/config';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { FinanceModule } from './modules/finance/finance.module';
import { TenantMiddleware } from './middleware/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    InventoryModule,
    TenantModule,
    FinanceModule
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('inventory'); // Inventory routes වලට පමණක් apply කරන්න
  }
}