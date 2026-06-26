/* Path: backend/src/common/guards/feature.guard.ts */
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectConnection } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class FeatureGuard implements CanActivate {
    constructor(@InjectConnection() private readonly knex: Knex, private featureName: string) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const tenantId = request.headers['x-tenant-id'];
        if (!tenantId) return false;

        const tenant = await this.knex('tenants').where('slug', tenantId).first();
        if (!tenant) throw new ForbiddenException('Tenant not found');

        return true;
    }
}