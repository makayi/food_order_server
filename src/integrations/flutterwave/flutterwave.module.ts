import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlutterwaveService } from './flutterwave.service';
import { Order } from '../../entities/order.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [FlutterwaveService],
  exports: [FlutterwaveService],
})
export class FlutterwaveModule {}
