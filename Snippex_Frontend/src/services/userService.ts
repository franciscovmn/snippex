import api from "./api";

export interface UpdateProfileDTO {
  name: string;
  user_name: string;
  email: string;
}

export interface UserSubscription {
  plan_id: 'free' | 'pro' | 'team';
  billing_cycle: 'monthly' | 'yearly' | null;
  status: 'free' | 'pending_payment' | 'active' | 'inactive';
  checkout_url: string | null;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  activated_at: string | null;
  canceled_at: string | null;
}

export interface User {
  id: number;
  name: string;
  user_name: string;
  email: string;
  subscription?: UserSubscription;
}

export const userService = {
  async me() {
    const response = await api.get('/api/users/me')
    return response.data
  },

  async updateProfile(data: UpdateProfileDTO) {
    const response = await api.put('/api/users/edit', data)
    return response.data
  },

  async changePassword(password: String) {
    const response = await api.put('/api/users/changePassword', {
      password,
    })
    return response.data
  },

  async cancelSubscriptionRenewal() {
    const response = await api.put('/api/users/subscription/cancel-renewal')
    return response.data
  },

  async createCheckoutIntent(planId: 'pro' | 'team', billingCycle: 'monthly' | 'yearly') {
    const response = await api.post('/api/users/subscription/checkout-intent', {
      planId,
      billingCycle,
    })
    return response.data
  },
};
