
export type Category = 'Stationery' | 'Electronics' | 'Books' | 'Uniforms' | 'Art Supplies' | 'Other';
export type ItemStatus = 'pending' | 'approved' | 'rejected' | 'taken';
export type Language = 'ar' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Badge {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  color: string;
  condition: string;
}

export interface SchoolItem {
  id: string;
  name: string;
  description: string;
  notes?: string;
  category: Category;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  pickupLocation: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  imageUrl: string;
  imageUrls?: string[];
  likes?: string[]; // Array of user IDs who liked the item
  contactPhone?: string;
  donorId: string;
  donorName: string;
  isAvailable: boolean;
  status: ItemStatus;
  createdAt: number;
}

export interface ItemRequest {
  id: string;
  studentId: string;
  studentName: string;
  itemName: string;
  category: Category;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  grade?: string;
  bio?: string;
  interests?: string[];
  avatar: string;
  profilePic: string;
  socialPoints: number;
  unlockedBadges: string[];
  role: 'Student' | 'Teacher' | 'Admin';
  preferences: {
    theme: ThemeMode;
    notifications: {
      email: boolean;
      inApp: boolean;
    };
    language: Language;
    privacyShowHistory: boolean;
  };
}
