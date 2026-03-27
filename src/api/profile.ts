import { apiClient, getApiErrorMessage } from "@/lib/api";

export interface ProviderProfileDetails {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialty: string;
  experience: number;
  profileImageUrl?: string;
  licenseNumber?: string;
  licenseDocuments?: string[];
  bio?: string;
}

export interface UpdateProviderProfilePayload {
  firstName: string;
  lastName: string;
  bio: string;
  specialty: string;
  experience: number;
}

interface ProviderProfileResponse {
  status: "success" | "fail";
  data?: ProviderProfileDetails;
  message?: string;
}

interface UpdateProviderProfileResponse {
  status: "success" | "fail";
  data?: ProviderProfileDetails;
  message?: string;
}

interface UpdateProviderProfilePhotoResponse {
  status: "success" | "fail";
  data?: ProviderProfileDetails;
  message?: string;
}

export async function getProviderProfile() {
  try {
    const { data } = await apiClient.get<ProviderProfileResponse>("/profile");

    if (data?.status !== "success" || !data?.data) {
      throw new Error(data?.message || "Could not load profile data");
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function updateProviderProfile(
  payload: UpdateProviderProfilePayload,
) {
  try {
    const { data } = await apiClient.put<UpdateProviderProfileResponse>(
      "/profile",
      payload,
    );

    if (data?.status !== "success") {
      throw new Error(data?.message || "Could not update profile data");
    }

    return {
      profile: data?.data,
      message: data?.message || "Profile updated successfully.",
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function updateProviderProfilePhoto(photo: File) {
  const formData = new FormData();
  formData.append("photo", photo);

  try {
    const { data } = await apiClient.post<UpdateProviderProfilePhotoResponse>(
      "/profile/photo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (data?.status !== "success") {
      throw new Error(data?.message || "Could not update profile photo");
    }

    return {
      profile: data?.data,
      message: data?.message || "Profile photo updated successfully.",
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
