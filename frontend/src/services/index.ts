import api from './api';
import type {
  AuthResponse,
  DashboardAnalytics,
  RationCard,
  CardEntitlement,
  StockSummary,
  StockBatch,
  StockMovement,
  Distribution,
  Receipt,
  Complaint,
  NotificationItem,
  AuditLog,
  RationShop,
  Commodity,
  EntitlementRule,
  User,
} from '../types';

export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
};

export const analyticsApi = {
  getDashboardData: async (shopId?: number) => {
    const res = await api.get<DashboardAnalytics>('/analytics', {
      params: shopId ? { shopId } : {},
    });
    return res.data;
  },
};

export const rationCardApi = {
  searchCards: async (params?: { shopId?: number; category?: string; query?: string; page?: number; size?: number }) => {
    const res = await api.get<{ content: RationCard[]; totalElements: number; totalPages: number }>('/ration-cards', { params });
    return res.data;
  },
  getCardById: async (id: number) => {
    const res = await api.get<RationCard>(`/ration-cards/${id}`);
    return res.data;
  },
  getCardByNumber: async (cardNumber: string) => {
    const res = await api.get<RationCard>(`/ration-cards/search/${cardNumber}`);
    return res.data;
  },
  getCardEntitlements: async (cardId: number) => {
    const res = await api.get<CardEntitlement[]>(`/ration-cards/${cardId}/entitlements`);
    return res.data;
  },
  createCard: async (data: Partial<RationCard>) => {
    const res = await api.post<RationCard>('/ration-cards', data);
    return res.data;
  },
  updateCard: async (id: number, data: Partial<RationCard>) => {
    const res = await api.put<RationCard>(`/ration-cards/${id}`, data);
    return res.data;
  },
  toggleStatus: async (id: number) => {
    const res = await api.patch<RationCard>(`/ration-cards/${id}/toggle-status`);
    return res.data;
  },
};

export const distributionApi = {
  getDistributions: async (shopId: number = 1, page: number = 0, size: number = 10) => {
    const res = await api.get<{ content: Distribution[]; totalElements: number; totalPages: number }>('/distributions', {
      params: { shopId, page, size },
    });
    return res.data;
  },
  getDistributionsForCard: async (cardId: number) => {
    const res = await api.get<Distribution[]>(`/distributions/card/${cardId}`);
    return res.data;
  },
  getReceipt: async (txnRef: string) => {
    const res = await api.get<Receipt>(`/distributions/receipt/${txnRef}`);
    return res.data;
  },
  processDistribution: async (payload: {
    rationCardId: number;
    shopId?: number;
    idempotencyKey?: string;
    receiptNotes?: string;
    items: Array<{ commodityId: number; quantity: number }>;
  }) => {
    const res = await api.post<Distribution>('/distributions', payload);
    return res.data;
  },
};

export const stockApi = {
  getStockSummary: async (shopId: number = 1) => {
    const res = await api.get<StockSummary[]>('/stock/summary', { params: { shopId } });
    return res.data;
  },
  getBatches: async (shopId: number = 1) => {
    const res = await api.get<StockBatch[]>('/stock/batches', { params: { shopId } });
    return res.data;
  },
  getMovements: async (shopId: number = 1, page: number = 0, size: number = 10) => {
    const res = await api.get<{ content: StockMovement[]; totalElements: number; totalPages: number }>('/stock/movements', {
      params: { shopId, page, size },
    });
    return res.data;
  },
  receiveStock: async (payload: {
    shopId?: number;
    commodityId: number;
    batchNumber: string;
    warehouseRef: string;
    receivedDate: string;
    quantity: number;
  }) => {
    const res = await api.post<StockBatch>('/stock/receive', payload);
    return res.data;
  },
  adjustStock: async (payload: {
    shopId?: number;
    commodityId: number;
    batchId?: number;
    movementType: string;
    quantity: number;
    reason: string;
  }) => {
    const res = await api.post<StockMovement>('/stock/adjust', payload);
    return res.data;
  },
};

export const commodityApi = {
  getAll: async () => {
    const res = await api.get<Commodity[]>('/commodities');
    return res.data;
  },
  create: async (data: Partial<Commodity>) => {
    const res = await api.post<Commodity>('/commodities', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Commodity>) => {
    const res = await api.put<Commodity>(`/commodities/${id}`, data);
    return res.data;
  },
};

export const entitlementApi = {
  getRules: async () => {
    const res = await api.get<EntitlementRule[]>('/entitlements/rules');
    return res.data;
  },
  saveRule: async (data: Partial<EntitlementRule> & { commodityId: number }) => {
    const res = await api.post<EntitlementRule>('/entitlements/rules', data);
    return res.data;
  },
};

export const shopApi = {
  getAll: async () => {
    const res = await api.get<RationShop[]>('/shops');
    return res.data;
  },
  create: async (data: Partial<RationShop>) => {
    const res = await api.post<RationShop>('/shops', data);
    return res.data;
  },
  update: async (id: number, data: Partial<RationShop>) => {
    const res = await api.put<RationShop>(`/shops/${id}`, data);
    return res.data;
  },
};

export const complaintApi = {
  getMyComplaints: async () => {
    const res = await api.get<Complaint[]>('/complaints/my');
    return res.data;
  },
  getShopComplaints: async (shopId: number = 1, page: number = 0, size: number = 10) => {
    const res = await api.get<{ content: Complaint[]; totalElements: number; totalPages: number }>('/complaints/shop', {
      params: { shopId, page, size },
    });
    return res.data;
  },
  getAllComplaints: async () => {
    const res = await api.get<Complaint[]>('/complaints/all');
    return res.data;
  },
  createComplaint: async (data: { category: string; subject: string; description: string; shopId?: number; rationCardId?: number }) => {
    const res = await api.post<Complaint>('/complaints', data);
    return res.data;
  },
  updateStatus: async (id: number, status: string, resolutionRemarks?: string) => {
    const res = await api.patch<Complaint>(`/complaints/${id}/status`, { status, resolutionRemarks });
    return res.data;
  },
};

export const notificationApi = {
  getMyNotifications: async () => {
    const res = await api.get<NotificationItem[]>('/notifications');
    return res.data;
  },
  markAsRead: async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
  },
};

export const auditLogApi = {
  getAuditLogs: async (params?: { shopId?: number; action?: string; startDate?: string; endDate?: string; page?: number; size?: number }) => {
    const res = await api.get<{ content: AuditLog[]; totalElements: number; totalPages: number }>('/audit-logs', { params });
    return res.data;
  },
};

export const userApi = {
  getAll: async () => {
    const res = await api.get<User[]>('/users');
    return res.data;
  },
  create: async (data: Partial<User> & { password?: string }) => {
    const res = await api.post<User>('/users', data);
    return res.data;
  },
  update: async (id: number, data: Partial<User> & { password?: string }) => {
    const res = await api.put<User>(`/users/${id}`, data);
    return res.data;
  },
};

export const reportApi = {
  getReconciliation: async (shopId?: number) => {
    const res = await api.get<any>('/reports/reconciliation', { params: shopId ? { shopId } : {} });
    return res.data;
  },
  exportDistributionsCsv: (shopId?: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (shopId) params.append('shopId', shopId.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/reports/export/distributions?${params.toString()}`;
    
    // Download via link
    window.open(url, '_blank');
  },
  exportLedgerCsv: (shopId?: number) => {
    const params = new URLSearchParams();
    if (shopId) params.append('shopId', shopId.toString());
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/reports/export/ledger?${params.toString()}`;
    window.open(url, '_blank');
  },
};


export const beneficiaryAuthApi = {
  login: async (credentials: { cardNumber: string; dateOfBirth: string; password?: string }) => {
    const res = await api.post<AuthResponse>('/auth/beneficiary-login', credentials);
    return res.data;
  },
  setupPassword: async (payload: { cardNumber: string; currentPassword?: string; newPassword: string }) => {
    const res = await api.post<{ message: string }>('/auth/setup-password', payload);
    return res.data;
  },
};

export const bookingApi = {
  getAvailableSlots: async (shopId: number, date: string) => {
    const res = await api.get<any[]>('/bookings/slots', { params: { shopId, date } });
    return res.data;
  },
  createBooking: async (payload: {
    rationCardId: number;
    shopId: number;
    slotId?: number;
    bookingDate?: string;
    slotDate?: string;
    slotTime?: string;
    requestedItems?: any[];
  }) => {
    const res = await api.post<any>('/bookings', payload);
    return res.data;
  },
  getMyBookings: async (cardId?: number) => {
    const res = await api.get<any[]>('/bookings/my', { params: cardId ? { cardId } : {} });
    return res.data;
  },
  cancelBooking: async (id: number, reason?: string) => {
    const res = await api.patch<any>(`/bookings/${id}/cancel`, reason ? { reason } : {});
    return res.data;
  },
};

export const otpApi = {
  generateChallenge: async (rationCardId: number) => {
    const res = await api.post<any>('/otp/generate', { rationCardId });
    return res.data;
  },
  verifyOtp: async (challengeId: string, otp: string) => {
    const res = await api.post<{ verified: boolean; message: string }>('/otp/verify', { challengeId, otp });
    return res.data;
  },
};

export const reconciliationApi = {
  getConflicts: async (shopId?: number, status?: string) => {
    const res = await api.get<any[]>('/reconciliation/conflicts', {
      params: { ...(shopId ? { shopId } : {}), ...(status ? { status } : {}) },
    });
    return res.data;
  },
  resolveConflict: async (conflictId: number, payload: { action: 'RESOLVED' | 'DISMISSED'; resolutionRemarks: string }) => {
    const res = await api.post<any>(`/reconciliation/conflicts/${conflictId}/resolve`, payload);
    return res.data;
  },
};

export const datasetApi = {
  getCurrentWeek: async () => {
    const res = await api.get<any>('/datasets/current');
    return res.data;
  },
  getWeekDataset: async (year: number, month: string, week: number) => {
    const res = await api.get<any>(`/datasets/${year}/${month}/week-${week}`);
    return res.data;
  },
};

export const chatbotApi = {
  sendMessage: async (
    message: string,
    cardId?: number,
    shopId?: number,
    history?: { role: string; content: string }[],
    conversationId?: string
  ) => {
    const res = await api.post<{
      reply: string;
      quickReplies: string[];
      suggestions?: string[];
      source?: string;
      timestamp: string;
      conversationId?: string;
      resolvedEntity?: string;
      data?: Record<string, any>;
    }>('/chatbot/message', {
      message,
      rationCardId: cardId,
      shopId: shopId || 1,
      history,
      conversationId,
    });
    return {
      ...res.data,
      quickReplies: res.data.quickReplies || res.data.suggestions || [],
    };
  },
};

export const shopStatusApi = {
  toggleStatus: async (shopId: number, isOpen: boolean) => {
    const res = await api.patch<RationShop>(`/shops/${shopId}/status`, null, { params: { isOpen } });
    return res.data;
  },
};
