/* Path: backend/src/modules/auth/auth.controller.ts */
import { Controller, Post, Body, Get, Headers, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: any) {
        return this.authService.login(body.email, body.pass);
    }

    // SaaS Global Users (SUPER_ADMIN ONLY)
    @Get('users/list')
    @Roles('SUPER_ADMIN')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async getAllUsers() {
        return await this.authService.findAllUsers();
    }

    // Global User Status (SUPER_ADMIN ONLY)
    @Post('users/toggle-status')
    @Roles('SUPER_ADMIN')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async toggleUserStatus(@Body() body: { id: string; isActive: boolean }) {
        return await this.authService.toggleUserStatus(body.id, body.isActive);
    }

    // Tenant-Specific Users (TENANT_ADMIN / Manager ONLY)
    @Get('tenant-users')
    @Roles('TENANT_ADMIN')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async getTenantUsers(@Headers('x-tenant-id') tenantSlug: string) {
        if (!tenantSlug) {
            throw new BadRequestException('x-tenant-id header is missing');
        }
        const tenant = await this.authService.findTenantBySlug(tenantSlug);
        if (!tenant) {
            throw new BadRequestException('Tenant workspace not found');
        }
        return await this.authService.findTenantUsers(tenant.id);
    }

    // Tenant User Registration (TENANT_ADMIN / Manager ONLY)
    @Post('tenant-users/create')
    @Roles('TENANT_ADMIN')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async createTenantUser(
        @Headers('x-tenant-id') tenantSlug: string,
        @Body() body: { email: string; pass: string; role: string }
    ) {
        if (!tenantSlug) {
            throw new BadRequestException('x-tenant-id header is missing');
        }
        const tenant = await this.authService.findTenantBySlug(tenantSlug);
        if (!tenant) {
            throw new BadRequestException('Tenant workspace not found');
        }
        return await this.authService.createTenantUser(body.email, body.pass, body.role, tenant.id);
    }
}