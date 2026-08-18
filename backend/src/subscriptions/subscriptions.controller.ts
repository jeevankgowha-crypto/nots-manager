import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.findAllPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMySubscriptions(@Req() req: any) {
    return this.subscriptionsService.findUserSubscriptions(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('trial')
  async getTrialStatus(@Req() req: any) {
    return this.subscriptionsService.getTrialStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('buy')
  async buySubscription(@Req() req: any, @Body() body: { planId: string; couponCode?: string }) {
    return this.subscriptionsService.createSubscription(req.user.id, body.planId, body.couponCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('coupons/validate')
  async validateCoupon(@Body() body: { code: string; amount: number }) {
    return this.subscriptionsService.validateCoupon(body.code, body.amount);
  }

  // Admin APIs
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post('plans')
  async createPlan(@Body() body: { name: string; price: number; durationDays: number; description: string }) {
    return this.subscriptionsService.createPlan(body);
  }
}
