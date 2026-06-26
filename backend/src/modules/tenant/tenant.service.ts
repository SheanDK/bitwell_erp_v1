/* Path: backend/src/modules/tenant/tenant.service.ts */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectConnection } from 'nestjs-knex';
import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantService {
    constructor(@InjectConnection() private readonly knex: Knex) { }

    async findAll() {
        return await this.knex('tenants')
            .withSchema('public')
            .leftJoin('tenant_subscriptions', 'tenants.id', '=', 'tenant_subscriptions.tenant_id')
            .where('tenants.is_deleted', false)
            .select(
                'tenants.id',
                'tenants.name',
                'tenants.slug',
                'tenants.phone',
                'tenants.db_schema',
                'tenants.created_at',
                'tenants.is_active',
                'tenants.features',
                'tenant_subscriptions.plan_id'
            );
    }

    async updateTenantComplete(data: { id: string; name: string; slug: string; phone: string; planId: number }) {
        const sanitizedSlug = data.slug.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const schemaName = `tenant_${sanitizedSlug}`;

        return await this.knex.transaction(async (trx) => {
            await trx('tenants')
                .withSchema('public')
                .where({ id: data.id })
                .update({
                    name: data.name,
                    slug: data.slug,
                    phone: data.phone,
                    db_schema: schemaName
                });

            await trx('tenant_subscriptions')
                .withSchema('public')
                .where({ tenant_id: data.id })
                .update({
                    plan_id: data.planId
                });

            return { message: 'Workspace infrastructure updated successfully.' };
        });
    }

    async createTenant(data: { name: string; slug: string; phone: string; ownerEmail: string; ownerPass: string; planId: number }) {
        const sanitizedSlug = data.slug.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const schemaName = `tenant_${sanitizedSlug}`;

        const exists = await this.knex('tenants').withSchema('public').where({ slug: data.slug }).first();
        if (exists) {
            throw new BadRequestException('Workspace slug already exists');
        }

        const passwordHash = await bcrypt.hash(data.ownerPass, 10);

        return await this.knex.transaction(async (trx) => {
            const [tenant] = await trx('tenants').withSchema('public').insert({
                name: data.name,
                slug: data.slug,
                phone: data.phone,
                db_schema: schemaName,
                features: JSON.stringify({ qr_tracing: true, accounting: false })
            }).returning('*');

            await trx('tenant_subscriptions').withSchema('public').insert({
                tenant_id: tenant.id,
                plan_id: data.planId,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });

            await trx('users').withSchema('public').insert({
                email: data.ownerEmail,
                password_hash: passwordHash,
                role: 'TENANT_ADMIN',
                tenant_id: tenant.id
            });

            await trx.raw(`CREATE SCHEMA IF NOT EXISTS ??`, [schemaName]);
            await trx.raw(`
                CREATE TABLE IF NOT EXISTS ${schemaName}.racks (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    code VARCHAR(50) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS ${schemaName}.items (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    sku VARCHAR(100) UNIQUE,
                    rack_id UUID REFERENCES ${schemaName}.racks(id),
                    quantity INT DEFAULT 0,
                    price DECIMAL(12, 2) DEFAULT 0,
                    cost_price DECIMAL(12, 2) DEFAULT 0,
                    barcode VARCHAR(100),
                    weight DECIMAL(10, 3),
                    image_url TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS ${schemaName}.transactions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    item_id UUID REFERENCES ${schemaName}.items(id),
                    type VARCHAR(20),
                    amount DECIMAL(12, 2),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            return { message: `Workspace '${data.name}' and administrator deployed successfully.` };
        });
    }

    async getSuperAdminStats() {
        const tenantsCount = await this.knex('tenants').withSchema('public').count('id as count').first();
        const usersCount = await this.knex('users').withSchema('public').count('id as count').first();
        const totalTenants = parseInt(tenantsCount?.count as string) || 0;
        const estimatedRevenue = totalTenants * 10000;

        return {
            totalTenants,
            totalUsers: parseInt(usersCount?.count as string) || 0,
            revenue: `EUR ${estimatedRevenue.toLocaleString()}`,
            status: 'Healthy'
        };
    }

    async findAuditLogs() {
        return await this.knex('audit_logs')
            .withSchema('public')
            .orderBy('created_at', 'desc')
            .select('*');
    }

    async updateTenantFeatures(id: string, features: any) {
        return await this.knex('tenants')
            .withSchema('public')
            .where({ id })
            .update({
                features: typeof features === 'string' ? JSON.parse(features) : features
            });
    }

    async toggleTenantStatus(id: string, isActive: boolean) {
        const status = isActive === true || isActive as any === 'true';

        return await this.knex.transaction(async (trx) => {
            await trx('tenants')
                .withSchema('public')
                .where({ id })
                .update({ is_active: status });
            await trx('users')
                .withSchema('public')
                .where({ tenant_id: id })
                .update({ is_active: status });

            return { message: 'Tenant and associated users status updated.' };
        });
    }

    async findTenantBySlug(slug: string) {
        return await this.knex('tenants').withSchema('public').where({ slug }).first();
    }

    async getTenantSettings(tenantId: string) {
        return await this.knex('tenants')
            .withSchema('public')
            .where({ id: tenantId })
            .select('name', 'logo_url', 'currency', 'tax_rate', 'features')
            .first();
    }

    async updateTenantSettings(tenantId: string, data: any) {
        return await this.knex('tenants')
            .withSchema('public')
            .where({ id: tenantId })
            .update({
                name: data.name,
                logo_url: data.logo_url,
                currency: data.currency,
                tax_rate: data.tax_rate
            });
    }


    async updateTenantInfo(id: string, name: string, slug: string) {
        const sanitizedSlug = slug.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const schemaName = `tenant_${sanitizedSlug}`;

        return await this.knex.transaction(async (trx) => {
            await trx('tenants')
                .withSchema('public')
                .where({ id })
                .update({
                    name,
                    slug,
                    db_schema: schemaName
                });

            return { message: 'Workspace info updated successfully.' };
        });
    }

    async softDeleteTenant(id: string) {
        return await this.knex.transaction(async (trx) => {
            await trx('tenants')
                .withSchema('public')
                .where({ id })
                .update({ is_deleted: true, is_active: false });
            await trx('users')
                .withSchema('public')
                .where({ tenant_id: id })
                .update({ is_active: false });

            return { message: 'Tenant successfully archived and users deactivated.' };
        });
    }

}

