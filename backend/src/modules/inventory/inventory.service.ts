/* Path: backend/src/modules/inventory/inventory.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectConnection } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class InventoryService {
    constructor(@InjectConnection() private readonly knex: Knex) { }

    // භාණ්ඩ සහ ඒවා තිබෙන රාක්ක විස්තර සහිතව ලබා ගැනීම
    async getInventoryWithRacks() {
        return await this.knex('items')
            .join('racks', 'items.rack_id', '=', 'racks.id')
            .select('items.*', 'racks.code as rack_code');
    }

    // අලුත් භාණ්ඩයක් රාක්කයකට ඇතුළත් කිරීම
    async addItem(data: { name: string; sku: string; rack_id: string; quantity: number }) {
        return await this.knex('items').insert(data);
    }
}