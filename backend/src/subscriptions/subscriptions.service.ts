import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async createPlan(data: { name: string; price: number; durationDays: number; description: string }) {
    return this.prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        price: parseFloat(data.price as any),
        description: data.description,
        durationDays: parseInt(data.durationDays as any),
      },
    });
  }

  async findAllPlans() {
    return this.prisma.subscriptionPlan.findMany();
  }

  async validateCoupon(code: string, purchaseAmount: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (purchaseAmount < coupon.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`);
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (purchaseAmount * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'FLAT') {
      discount = coupon.value;
    }

    const finalAmount = Math.max(0, purchaseAmount - discount);

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
      discountAmount: parseFloat(discount.toFixed(2)),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
    };
  }

  async createSubscription(userId: string, planId: string, couponCode?: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    let amount = plan.price;
    if (couponCode) {
      const discountResult = await this.validateCoupon(couponCode, plan.price);
      amount = discountResult.finalAmount;

      // Increment coupon usage
      await this.prisma.coupon.update({
        where: { code: couponCode.toUpperCase() },
        data: { usedCount: { increment: 1 } },
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    // Create active subscription
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        startDate,
        endDate,
        status: 'ACTIVE',
      },
      include: { plan: true },
    });

    // Create payment history as successful
    await this.prisma.payment.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        amount,
        paymentGatewayId: 'PAY-' + Math.floor(100000 + Math.random() * 900000),
        status: 'PAID',
      },
    });

    return subscription;
  }

  async findUserSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTrialStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const trialEnd = new Date(user.trialEndDate);
    const hasTrialActive = trialEnd > now;
    
    // Remaining hours
    const diffMs = trialEnd.getTime() - now.getTime();
    const remainingHours = hasTrialActive ? Math.ceil(diffMs / (1000 * 60 * 60)) : 0;

    // Check if user has active subscription
    const activeSub = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: now },
      },
    });

    return {
      isTrialActive: hasTrialActive,
      trialEndDate: user.trialEndDate,
      remainingHours,
      hasPremiumAccess: hasTrialActive || !!activeSub,
      isPremiumSubscriber: !!activeSub,
    };
  }
}
