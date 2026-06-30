/* Path: backend/src/modules/auth/auth.service.ts */
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectConnection } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class AuthService {
    constructor(
        @InjectConnection() private readonly knex: Knex,
        private readonly jwtService: JwtService
    ) { }

    async login(email: string, pass: string) {
        const user = await this.knex('users').withSchema('public').where({ email }).first();

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.is_active === false || user.is_active === 0) {
            throw new UnauthorizedException('Your account has been suspended by the administrator.');
        }

        let tenantSlug = 'superadmin';

        if (user.tenant_id) {
            const tenant = await this.knex('tenants').withSchema('public').where({ id: user.tenant_id }).first();
            if (tenant) {
                if (tenant.is_active === false || tenant.is_active === 0) {
                    throw new UnauthorizedException('Your organization workspace has been suspended.');
                }
                tenantSlug = tenant.slug;
            }
        }

        if (!(await bcrypt.compare(pass, user.password_hash))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenant_id };
        return {
            access_token: this.jwtService.sign(payload),
            role: user.role,
            tenant_id: user.tenant_id,
            tenant_slug: tenantSlug
        };
    }

    // 2. Get all users for SUPER_ADMIN
    async findAllUsers() {
        return await this.knex('users')
            .withSchema('public')
            .leftJoin('tenants', 'users.tenant_id', '=', 'tenants.id')
            .select(
                'users.id',
                'users.email',
                'users.role',
                'users.is_active',
                'users.created_at',
                'tenants.name as tenant_name',
                'tenants.slug as tenant_slug'
            );
    }

    // 3. Toggle global user status for SUPER_ADMIN
    async toggleUserStatus(id: string, isActive: boolean) {
        return await this.knex('users')
            .withSchema('public')
            .where({ id })
            .update({ is_active: isActive });
    }

    // 4. Helper to find tenant by slug
    async findTenantBySlug(slug: string) {
        return await this.knex('tenants')
            .withSchema('public')
            .where({ slug })
            .first();
    }

    // 5. Get users belonging to a specific tenant for TENANT_ADMIN
    async findTenantUsers(tenantId: string) {
        return await this.knex('users')
            .withSchema('public')
            .where({ tenant_id: tenantId })
            .andWhere('role', '!=', 'SUPER_ADMIN')
            .select('id', 'email', 'role', 'is_active', 'created_at');
    }

    // 6. Create tenant user (Staff) inside isolated tenant
    async createTenantUser(email: string, pass: string, role: string, tenantId: string) {
        const exists = await this.knex('users').withSchema('public').where({ email }).first();
        if (exists) {
            throw new BadRequestException('Email address is already registered.');
        }

        const passwordHash = await bcrypt.hash(pass, 10);

        await this.knex('users').withSchema('public').insert({
            email,
            password_hash: passwordHash,
            role: role || 'USER',
            tenant_id: tenantId,
            is_active: true
        });

        return { message: 'User created successfully.' };
    }
}