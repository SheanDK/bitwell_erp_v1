// backend/src/modules/auth/auth.controller.ts

import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: any) {
        return this.authService.login(body.email, body.pass);
    }
    @Get('users/list')
    @Roles('SUPER_ADMIN')
    async getAllUsers() {
        return await this.authService.findAllUsers();
    }

    @Post('users/toggle-status')
    async toggleUserStatus(@Body() body: { id: string; isActive: boolean }) {
        return await this.authService.toggleUserStatus(body.id, body.isActive);
    }
}