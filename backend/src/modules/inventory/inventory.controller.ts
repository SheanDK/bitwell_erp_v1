import { Controller, Get, Post, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get('list')
    async getInventory() {
        return await this.inventoryService.getInventoryWithRacks();
    }

    @Post('add')
    async add(@Body() body: any) {
        return await this.inventoryService.addItem(body);
    }
}