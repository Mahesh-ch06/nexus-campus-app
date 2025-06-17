import { supabase } from "@/integrations/supabase/client";

export interface PointsTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: 'earned' | 'spent' | 'redeemed';
  reason: string;
  reference_id?: string;
  created_at: string;
  created_by?: string;
  metadata?: any;
}

export interface Voucher {
  id: string;
  title: string;
  description?: string;
  points_required: number;
  value: number;
  category: string;
  image_url?: string;
  terms_conditions?: string;
  valid_until?: string;
  max_redemptions: number;
  current_redemptions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoucherRedemption {
  id: string;
  user_id: string;
  voucher_id: string;
  points_spent: number;
  redemption_code: string;
  status: 'active' | 'used' | 'expired';
  redeemed_at: string;
  used_at?: string;
  expires_at: string;
  voucher?: Voucher;
}

export const getPointsHistory = async (userId: string): Promise<PointsTransaction[]> => {
  try {
    console.log('Fetching points history for userId:', userId);
    
    const { data, error } = await supabase
      .from('activity_points_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching points history:', error);
    }

    console.log('Points history data:', data);

    // If no history records exist but user has points, create a default entry to show current points
    if ((!data || data.length === 0)) {
      // Get user's current points to show something in history
      const { data: engagementData } = await supabase
        .from('engagement')
        .select('activity_points, created_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (engagementData && engagementData.activity_points > 0) {
        // Return a synthetic transaction to show the current points
        return [{
          id: 'initial-points',
          user_id: userId,
          points: engagementData.activity_points,
          transaction_type: 'earned' as const,
          reason: 'Initial activity points',
          created_at: engagementData.created_at || new Date().toISOString(),
        }];
      }
    }

    // Type assertion to ensure proper typing
    return (data || []).map(item => ({
      ...item,
      transaction_type: item.transaction_type as 'earned' | 'spent' | 'redeemed'
    }));
  } catch (error) {
    console.error('Error fetching points history:', error);
    return [];
  }
};

export const getCurrentPoints = async (firebaseUid: string): Promise<number> => {
  try {
    console.log('Fetching current points for firebaseUid:', firebaseUid);
    
    // First get the user's internal ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (!userData) {
      console.log('No user found for firebaseUid:', firebaseUid);
      return 0;
    }

    console.log('Found user ID:', userData.id);

    // Get current points from engagement table
    const { data: engagementData } = await supabase
      .from('engagement')
      .select('activity_points')
      .eq('user_id', userData.id)
      .maybeSingle();

    console.log('Engagement data:', engagementData);
    
    return engagementData?.activity_points || 0;
  } catch (error) {
    console.error('Error fetching current points:', error);
    return 0;
  }
};

export const getAvailableVouchers = async (): Promise<Voucher[]> => {
  try {
    // Using mock data since vouchers table doesn't exist in Supabase types yet
    const mockVouchers: Voucher[] = [
      {
        id: '1',
        title: 'Amazon Gift Card - $10',
        description: 'Redeem for a $10 Amazon gift card',
        points_required: 1000,
        value: 10.00,
        category: 'Shopping',
        terms_conditions: 'Valid for 1 year from redemption date. Cannot be exchanged for cash.',
        valid_until: '2025-12-31T23:59:59Z',
        max_redemptions: 100,
        current_redemptions: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Campus Cafeteria - $5',
        description: 'Get $5 credit for campus cafeteria',
        points_required: 500,
        value: 5.00,
        category: 'Food',
        terms_conditions: 'Valid for 30 days from redemption. Use at any campus dining location.',
        valid_until: '2025-12-31T23:59:59Z',
        max_redemptions: 200,
        current_redemptions: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Starbucks Gift Card - $15',
        description: 'Enjoy your favorite coffee with a $15 Starbucks card',
        points_required: 1500,
        value: 15.00,
        category: 'Coffee',
        terms_conditions: 'Valid at all Starbucks locations. No expiry date.',
        valid_until: '2025-12-31T23:59:59Z',
        max_redemptions: 50,
        current_redemptions: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        title: 'BookStore Voucher - $20',
        description: 'Get textbooks and supplies with this voucher',
        points_required: 2000,
        value: 20.00,
        category: 'Education',
        terms_conditions: 'Valid for academic books and supplies only. 6 months validity.',
        valid_until: '2025-12-31T23:59:59Z',
        max_redemptions: 75,
        current_redemptions: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return mockVouchers;
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return [];
  }
};

export const getUserRedemptions = async (userId: string): Promise<VoucherRedemption[]> => {
  try {
    // Return empty array for now since voucher_redemptions table doesn't exist yet
    return [];
  } catch (error) {
    console.error('Error fetching user redemptions:', error);
    return [];
  }
};

export const redeemVoucher = async (
  voucherId: string,
  userId: string
): Promise<{ success: boolean; redemption?: VoucherRedemption; error?: string }> => {
  try {
    // Get voucher details from our mock data
    const vouchers = await getAvailableVouchers();
    const voucher = vouchers.find(v => v.id === voucherId);

    if (!voucher) {
      return { success: false, error: 'Voucher not found' };
    }

    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('id, firebase_uid')
      .eq('id', userId)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    // Check if user has enough points
    const currentPoints = await getCurrentPoints(userData.firebase_uid);
    if (currentPoints < voucher.points_required) {
      return { success: false, error: 'Insufficient points' };
    }

    // Generate unique redemption code
    const redemptionCode = `CC-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    // Calculate expiry date (30 days from redemption)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Deduct points from user's engagement record
    const { error: pointsError } = await supabase
      .from('engagement')
      .update({ 
        activity_points: currentPoints - voucher.points_required,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (pointsError) {
      console.error('Error deducting points:', pointsError);
      return { success: false, error: 'Failed to deduct points' };
    }

    // Add transaction record
    await supabase
      .from('activity_points_history')
      .insert({
        user_id: userId,
        points: -voucher.points_required,
        transaction_type: 'redeemed',
        reason: `Redeemed: ${voucher.title}`,
        reference_id: voucherId
      });

    const redemption: VoucherRedemption = {
      id: redemptionCode,
      user_id: userId,
      voucher_id: voucherId,
      points_spent: voucher.points_required,
      redemption_code: redemptionCode,
      status: 'active',
      redeemed_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    };

    return { success: true, redemption };
  } catch (error) {
    console.error('Error redeeming voucher:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const addPoints = async (
  userId: string,
  points: number,
  reason: string,
  transactionType: 'earned' | 'spent' = 'earned',
  referenceId?: string
): Promise<boolean> => {
  try {
    console.log('Adding points:', { userId, points, reason, transactionType });
    
    // Add to points history
    const { error: historyError } = await supabase
      .from('activity_points_history')
      .insert({
        user_id: userId,
        points: points,
        transaction_type: transactionType,
        reason: reason,
        reference_id: referenceId
      });

    if (historyError) {
      console.error('Error adding points history:', historyError);
      return false;
    }

    // Update user's total points in engagement table
    const { data: currentData } = await supabase
      .from('engagement')
      .select('activity_points')
      .eq('user_id', userId)
      .single();

    const currentPoints = currentData?.activity_points || 0;
    const newPoints = currentPoints + points;

    const { error: updateError } = await supabase
      .from('engagement')
      .update({ 
        activity_points: newPoints,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating points:', updateError);
      return false;
    }

    console.log('Successfully added points');
    return true;
  } catch (error) {
    console.error('Error adding points:', error);
    return false;
  }
};
