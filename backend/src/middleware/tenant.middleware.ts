/* Path: backend/src/middleware/tenant.middleware.ts */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectConnection } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(@InjectConnection() private readonly knex: Knex) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.headers['x-tenant-id'];
        console.log("Tenant ID received:", tenantId);

        if (!tenantId) {
            return res.status(400).json({ message: 'x-tenant-id header is missing' });
        }

        const schemaName = `tenant_${(tenantId as string).replace(/-/g, '_')}`;

        try {
            await this.knex.raw('SET search_path TO ??', [schemaName]);
            next();
        } catch (error) {
            return res.status(500).json({ message: 'Invalid tenant schema' });
        }
    }
}