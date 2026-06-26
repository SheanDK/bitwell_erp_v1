//backend/src/modules/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectConnection } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class AuthService {
    constructor(@InjectConnection() private readonly knex: Knex, private jwtService: JwtService) { }

    async login(email: string, pass: string) {
        const user = await this.knex('users').withSchema('public').where({ email }).first();

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 1. check user is active
        if (user.is_active === false || user.is_active === 0) {
            throw new UnauthorizedException('Your account has been suspended by the administrator.');
        }

        // 2. check tenant is active
        if (user.tenant_id) {
            const tenant = await this.knex('tenants').withSchema('public').where({ id: user.tenant_id }).first();
            if (tenant && (tenant.is_active === false || tenant.is_active === 0)) {
                throw new UnauthorizedException('Your organization workspace has been suspended.');
            }
        }

        if (!(await bcrypt.compare(pass, user.password_hash))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenant_id };
        return {
            access_token: this.jwtService.sign(payload),
            role: user.role,
            tenant_id: user.tenant_id
        };
    }

    // 1. get all users
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

    // 2. toggle user status
    async toggleUserStatus(id: string, isActive: boolean) {
        return await this.knex('users')
            .withSchema('public')
            .where({ id })
            .update({ is_active: isActive });
    }
}

