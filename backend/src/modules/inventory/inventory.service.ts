/* Path: backend/src/modules/inventory/inventory.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectConnection } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class InventoryService {
    constructor(@InjectConnection() private readonly knex: Knex) { }

    async findAll() {
        return await this.knex('items').withSchema('tenant_company1').select('*');
    }

    async addItem(data: { name: string; sku: string; quantity: number; price: number; cost_price: number; barcode?: string; weight?: number; image_url?: string }) {
        return await this.knex('items')
            .withSchema('tenant_company1')
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
                .withSchema('tenant_company1')
                .where({ code: rackCode })
                .first();

            if (!rack) {
                throw new Error(`Rack section '${rackCode}' not found in database.`);
            }

            const updated = await trx('items')
                .withSchema('tenant_company1')
                .where({ sku: itemSku })
                .update({ rack_id: rack.id });

            if (!updated) {
                throw new Error(`Product with SKU '${itemSku}' not found.`);
            }

            return { message: `Product '${itemSku}' successfully mapped to Rack '${rackCode}'.` };
        });
    }
}