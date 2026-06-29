/* Path: backend/src/modules/inventory/inventory.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectConnection } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class InventoryService {
    constructor(@InjectConnection() private readonly knex: Knex) { }

    // withSchema ඉවත් කළා - දැන් එය 100% Dynamic වේ
    async findAll() {
        return await this.knex('items')
            .leftJoin('racks', 'items.rack_id', '=', 'racks.id')
            .select(
                'items.id',
                'items.name',
                'items.sku',
                'items.quantity',
                'items.price',
                'items.cost_price',
                'items.image_url',
                'racks.code as rack_code',
                'racks.description as rack_description'
            );
    }

    async addItem(data: { name: string; sku: string; quantity: number; price: number; cost_price: number; barcode?: string; weight?: number; image_url?: string }) {
        return await this.knex('items')
            .insert({
                name: data.name,
                sku: data.sku,
                quantity: data.quantity,
                price: data.price,
                cost_price: data.cost_price,
                barcode: data.barcode,
                weight: data.weight,
                image_url: data.image_url
            });
    }

    async updateItemLocationByQR(itemSku: string, rackCode: string) {
        return await this.knex.transaction(async (trx) => {
            const rack = await trx('racks')
                .where({ code: rackCode })
                .first();

            if (!rack) {
                throw new Error(`Rack section '${rackCode}' not found in database.`);
            }

            const updated = await trx('items')
                .where({ sku: itemSku })
                .update({ rack_id: rack.id });

            if (!updated) {
                throw new Error(`Product with SKU '${itemSku}' not found.`);
            }

            return { message: `Product '${itemSku}' successfully mapped to Rack '${rackCode}'.` };
        });
    }
}