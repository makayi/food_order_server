import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlutterwaveModule } from './integrations/flutterwave/flutterwave.module';
import { OrdersModule } from './orders/orders.module';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Order],
      synchronize: true, // Set to false in production
    }),
    TypeOrmModule.forFeature([Order]),
    FlutterwaveModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
