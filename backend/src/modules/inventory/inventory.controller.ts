/* Path: backend/src/modules/inventory/inventory.controller.ts */
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get('list')
    async getInventory() {
        return await this.inventoryService.findAll();
    }

    @Post('add')
    @Roles('TENANT_ADMIN')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async add(@Body() body: any) {
        return await this.inventoryService.addItem(body);
    }

    @Post('map-qr')
    @UseGuards(AuthGuard('jwt'))
    async mapQr(@Body() body: { itemSku: string; rackCode: string }) {
        try {
            return await this.inventoryService.updateItemLocationByQR(body.itemSku, body.rackCode);
        } catch (error) {
            return { error: error.message };
        }
    }
}