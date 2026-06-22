//backend/src/middleware/tenant.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectConnection } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(@InjectConnection() private readonly knex: Knex) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.headers['x-tenant-id'] as string;

        if (!tenantId) {
            return res.status(400).json({ message: 'x-tenant-id header is missing' });
        }

        // දත්ත ගබඩාවේ ඇති schema එකට මාරු වීම
        const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

        // එම session එක සඳහා search_path එක වෙනස් කිරීම
        await this.knex.raw(`SET search_path TO ${schemaName}`);
        console.log(this.knex.raw(`SET search_path TO ${schemaName}`));
        next();
    }
}