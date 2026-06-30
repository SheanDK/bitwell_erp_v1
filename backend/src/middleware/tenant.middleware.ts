/* Path: backend/src/middleware/tenant.middleware.ts */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectConnection } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(@InjectConnection() private readonly knex: Knex) { }

    async use(req: Request, res: Response, next: NextFunction) {
        if (req.method === 'OPTIONS') {
            return next();
        }

        const tenantSlug = req.headers['x-tenant-id'] as string;

        if (!tenantSlug) {
            return res.status(400).json({ message: 'x-tenant-id header is missing' });
        }

        try {
            const tenant = await this.knex('tenants')
                .withSchema('public')
                .where({ slug: tenantSlug })
                .first();

            if (!tenant) {
                return res.status(404).json({ message: `Workspace '${tenantSlug}' not found.` });
            }

            const schemaName = tenant.db_schema;

            await this.knex.raw(`SET search_path TO ??`, [schemaName]);

            console.log(`[Middleware] Switched DB Context to Schema: ${schemaName}`);
            next();
        } catch (error) {
            console.error("Middleware DB Routing Error:", error);
            return res.status(500).json({ message: 'Database routing failed.' });
        }
    }
}