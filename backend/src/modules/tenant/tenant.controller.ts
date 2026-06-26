/* Path: backend/src/modules/tenant/tenant.controller.ts */
import { Controller, Get, Post, Body, Headers, BadRequestException, UseGuards, Delete } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('tenants')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Get('list')
    async list() {
        return await this.tenantService.findAll();
    }

    @Get('stats')
    async getStats() {
        return await this.tenantService.getSuperAdminStats();
    }

    @Post('create')
    async create(@Body() body: { name: string; slug: string; phone: string; ownerEmail: string; ownerPass: string; planId: number }) {
        return await this.tenantService.createTenant(body);
    }

    @Get('audit-logs')
    async getAuditLogs() {
        return await this.tenantService.findAuditLogs();
    }

    @Post('update-features')
    async updateFeatures(@Body() body: { id: string; features: any }) {
        return await this.tenantService.updateTenantFeatures(body.id, body.features);
    }

    @Post('toggle-status')
    async toggleStatus(@Body() body: { id: string; isActive: boolean }) {
        return await this.tenantService.toggleTenantStatus(body.id, body.isActive);
    }


    @Get('settings')
    @Roles('TENANT_ADMIN')
    @UseGuards(RolesGuard)
    async getSettings(@Headers('x-tenant-id') tenantSlug: string) {
        if (!tenantSlug) {
            throw new BadRequestException('x-tenant-id header is missing');
        }

        const tenant = await this.tenantService.findAll()
            .then(tenants => tenants.find(t => t.slug === tenantSlug));

        if (!tenant) {

            return { name: 'SaaS Platform', currency: 'USD', tax_rate: 0, features: {} };
        }

        return await this.tenantService.getTenantSettings(tenant.id);
    }


    @Post('settings/update')
    @Roles('TENANT_ADMIN')
    @UseGuards(RolesGuard)
    async updateSettings(@Headers('x-tenant-id') tenantSlug: string, @Body() body: any) {
        if (!tenantSlug) {
            throw new BadRequestException('x-tenant-id header is missing');
        }

        const tenant = await this.tenantService.findAll()
            .then(tenants => tenants.find(t => t.slug === tenantSlug));

        if (!tenant) {
            throw new BadRequestException('Tenant workspace not found');
        }

        return await this.tenantService.updateTenantSettings(tenant.id, body);
    }
    @Post('update-info')
    @Roles('TENANT_ADMIN')
    @UseGuards(RolesGuard)
    async updateInfo(@Headers('x-tenant-id') tenantSlug: string, @Body() body: any) {
        if (!tenantSlug) throw new BadRequestException('x-tenant-id header is missing');

        const tenant = await this.tenantService.findAll().then(t => t.find(x => x.slug === tenantSlug));
        if (!tenant) throw new BadRequestException('Tenant not found');

        return await this.tenantService.updateTenantInfo(tenant.id, body.name, body.slug);
    }

    @Delete('soft-delete')
    @Roles('TENANT_ADMIN')
    @UseGuards(RolesGuard)
    async softDelete(@Headers('x-tenant-id') tenantSlug: string) {
        if (!tenantSlug) throw new BadRequestException('x-tenant-id header is missing');

        const tenant = await this.tenantService.findAll().then(t => t.find(x => x.slug === tenantSlug));
        if (!tenant) throw new BadRequestException('Tenant not found');

        return await this.tenantService.softDeleteTenant(tenant.id);
    }
}