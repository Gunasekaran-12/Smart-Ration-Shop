export type Role = 'SUPER_ADMIN' | 'SHOP_OPERATOR' | 'BENEFICIARY' | 'AUDITOR';
export type CardCategory = 'AAY' | 'BPL' | 'APL' | 'PHH';
export type CalculationType = 'FIXED_PER_CARD' | 'PER_MEMBER';
export type StockMovementType = 'INWARD_RECEIPT' | 'DISTRIBUTION_OUTWARD' | 'ADJUSTMENT_DAMAGE' | 'ADJUSTMENT_CORRECTION' | 'ADJUSTMENT_TRANSFER';
export type ComplaintStatus = 'SUBMITTED' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
export type ComplaintCategory = 'STOCK_UNAVAILABLE' | 'OVERCHARGING' | 'WEIGHMENT_ISSUE' | 'CARD_UPDATE' | 'OPERATOR_BEHAVIOR' | 'OTHER';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: Role;
  shopId?: number;
  shopName?: string;
  rationCardId?: number;
  cardNumber?: string;
  isActive?: boolean;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: number;
  username: string;
  fullName: string;
  email?: string;
  role: Role;
  shopId?: number;
  shopName?: string;
  rationCardId?: number;
  cardNumber?: string;
}

export interface RationShop {
  id: number;
  shopNumber: string;
  shopName: string;
  district: string;
  talukBlock: string;
  address: string;
  contactPerson?: string;
  contactPhone?: string;
  isActive: boolean;
}

export interface Commodity {
  id: number;
  code: string;
  name: string;
  measurementUnit: string;
  subsidizedPrice: number;
  lowStockThreshold: number;
  isActive: boolean;
}

export interface FamilyMember {
  id?: number;
  fullName: string;
  relationship: string;
  age: number;
  gender: string;
}

export interface RationCard {
  id: number;
  cardNumber: string;
  headOfFamily: string;
  dateOfBirth?: string;
  cardCategory: CardCategory;
  familyMemberCount: number;
  shopId: number;
  shopNumber?: string;
  shopName?: string;
  address?: string;
  phoneNumber?: string;
  isActive: boolean;
  familyMembers?: FamilyMember[];
  createdAt?: string;
}

export interface CardEntitlement {
  commodityId: number;
  commodityCode: string;
  commodityName: string;
  measurementUnit: string;
  unitPrice: number;
  totalEntitledQuantity: number;
  distributedQuantity: number;
  remainingQuantity: number;
  availableShopStock: number;
  isEligibleForDistribution: boolean;
}

export interface EntitlementRule {
  id: number;
  cardCategory: CardCategory;
  commodity: Commodity;
  calculationType: CalculationType;
  baseQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  effectiveFrom: string;
  isActive: boolean;
}

export interface StockSummary {
  commodityId: number;
  commodityCode: string;
  commodityName: string;
  measurementUnit: string;
  currentStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  todayDistributed: number;
  daysUntilStockout?: number | null;
}

export interface StockBatch {
  id: number;
  shop?: RationShop;
  commodity: Commodity;
  batchNumber: string;
  warehouseRef: string;
  receivedDate: string;
  initialQuantity: number;
  availableQuantity: number;
  createdAt: string;
}

export interface StockMovement {
  id: number;
  shop: RationShop;
  commodity: Commodity;
  movementType: StockMovementType;
  quantity: number;
  balanceAfter: number;
  referenceId?: string;
  reason?: string;
  performedByUser?: User;
  createdAt: string;
}

export interface DistributionItem {
  id?: number;
  commodityId: number;
  commodityName: string;
  measurementUnit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  batchNumber?: string;
}

export interface Distribution {
  id: number;
  transactionReference: string;
  idempotencyKey?: string;
  rationCardId: number;
  cardNumber: string;
  headOfFamily: string;
  shopId: number;
  shopNumber?: string;
  shopName: string;
  distributedBy: string;
  distributionDate: string;
  totalAmount: number;
  status: string;
  receiptNotes?: string;
  items?: DistributionItem[];
}

export interface Receipt {
  transactionReference: string;
  shopNumber: string;
  shopName: string;
  shopAddress: string;
  shopContact?: string;
  cardNumber: string;
  headOfFamily: string;
  cardCategory: string;
  familyMembers: number;
  distributionDate: string;
  operatorName: string;
  totalAmount: number;
  receiptNotes?: string;
  items: DistributionItem[];
}

export interface Complaint {
  id: number;
  complaintNumber: string;
  rationCardId: number;
  cardNumber: string;
  beneficiaryName: string;
  shopId: number;
  shopName: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  status: ComplaintStatus;
  resolutionRemarks?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  username: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  shopId?: number;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface MonthlyTrend {
  month: string;
  riceDistributed: number;
  wheatDistributed: number;
  sugarDistributed: number;
  dalDistributed: number;
  transactionsCount: number;
}

export interface CommodityBreakdown {
  name: string;
  value: number;
  unit: string;
  color: string;
}

export interface ShopComparison {
  shopId: number;
  shopNumber: string;
  shopName: string;
  cardCount: number;
  stockAvailableKg: number;
  monthlyDistributedKg: number;
  transactionsCount: number;
  pendingComplaints: number;
}

export interface DashboardAnalytics {
  totalRationCards: number;
  activeShops: number;
  todayTransactions: number;
  todayDistributedKg: number;
  lowStockCount: number;
  totalStockReceivedThisMonth: number;
  commodityStock: StockSummary[];
  monthlyDistributionTrends: MonthlyTrend[];
  commodityDistributionBreakdown: CommodityBreakdown[];
  shopComparisons: ShopComparison[];
  recentStockMovements: Array<{
    id: number;
    shopName: string;
    commodityName: string;
    measurementUnit: string;
    movementType: string;
    quantity: number;
    balanceAfter: number;
    referenceId: string;
    reason: string;
    performedBy: string;
    createdAt: string;
  }>;
  recentDistributions: Distribution[];
}


export interface BookingSlot {
  id: number;
  shopId: number;
  slotTime: string;
  maxCapacity: number;
  bookedCount: number;
  availableCapacity: number;
  isAvailable: boolean;
}

export interface RationBooking {
  id: number;
  bookingReference: string;
  rationCardId: number;
  cardNumber: string;
  headOfFamily: string;
  shopId: number;
  shopNumber: string;
  shopName: string;
  slotDate: string;
  slotTime: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  commodityReservationsJson?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SlotAvailability {
  slotId?: number;
  id?: number;
  shopId?: number;
  shopName?: string;
  slotDate?: string;
  startTime?: string;
  endTime?: string;
  slotTime: string;
  maxCapacity: number;
  bookedCount: number;
  availableCapacity: number;
  remainingCapacity?: number;
  isAvailable: boolean;
  isActive?: boolean;
}

export interface OtpResponse {
  challengeId: string;
  rationCardId: number;
  expiresAt: string;
  attemptLimit: number;
  message: string;
  simulatedOtpForDemo?: string;
}

export interface TransactionConflict {
  id: number;
  distributionId?: number;
  transactionReference: string;
  shopId: number;
  shopNumber: string;
  shopName: string;
  rationCardId: number;
  cardNumber: string;
  conflictType: string;
  expectedStockJson: string;
  actualStockJson: string;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  remarks?: string;
  raisedByUserId: number;
  raisedByUsername: string;
  resolvedByUserId?: number;
  resolvedByUsername?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface WeeklyDataset {
  weekNumber: number;
  month: string;
  year: number;
  startDate: string;
  endDate: string;
  totalTransactions: number;
  totalKgDistributed: number;
  generatedAt: string;
  records: any[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  quickReplies?: string[];
}
