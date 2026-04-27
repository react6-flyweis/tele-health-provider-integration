export interface NotificationPrefs {
  emailAppointments: boolean;
  emailMessages: boolean;
  pushAppointments: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface ProviderProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  experience: number;
  rating: number;
  reviewCount: number;
  sessionFee: number;
  specializations: string[];
  profileImageUrl: string;
  verificationStatus: string;
  notificationPrefs: NotificationPrefs;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterProviderPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  specialty: string;
  licenseNumber: string;
  experience: number;
}

export interface ProviderLoginResponse {
  status: "success" | "fail";
  data?: ProviderProfile & { token: string };
  message?: string;
}

export interface ProviderRegisterResponse {
  status: "success" | "fail";
  data?: ProviderProfile & { token?: string };
  message?: string;
}
