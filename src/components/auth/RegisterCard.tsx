import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router";

import { registerProvider } from "@/api/auth";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { RegisterProviderPayload } from "@/types/auth";

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function RegisterCard() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experience, setExperience] = useState("");

  const registerMutation = useMutation({
    mutationFn: registerProvider,
    onSuccess: (data) => {
      if (data?.token) {
        const { token, ...provider } = data;
        setAuth({ token, provider });
        navigate("/dashboard", { replace: true });
        return;
      }

      navigate("/provider-login", {
        replace: true,
        state: {
          registrationSuccess: true,
          email,
        },
      });
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const parsedExperience = Number(experience);

    if (!Number.isFinite(parsedExperience) || parsedExperience < 0) {
      setFormError("Experience must be a valid non-negative number.");
      return;
    }

    if (!PASSWORD_PATTERN.test(password)) {
      setFormError(
        "Password must be at least 8 characters and include an uppercase letter, number, and special character.",
      );
      return;
    }

    const payload: RegisterProviderPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      specialty: specialty.trim(),
      licenseNumber: licenseNumber.trim(),
      experience: parsedExperience,
    };

    registerMutation.mutate(payload);
  };

  return (
    <div className="w-full max-w-[560px] mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#4A5565] mb-5"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="bg-white rounded-[16px] p-6 pb-5 shadow-[0px_3.9px_5.86px_-3.9px_#0000001A,0px_9.76px_14.64px_-2.93px_#0000001A]">
        <h2 className="text-[30px] font-bold text-center text-[#1E2939] mb-2">
          Register as Provider
        </h2>

        <p className="text-center text-[16px] text-[#4A5565] mb-8">
          Create your provider account to start managing patients and sessions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                First name
              </label>
              <input
                type="text"
                placeholder="Dr. Alice"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-12 px-4 rounded-[14px] placeholder:text-[#0A0A0A80] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Last name
              </label>
              <input
                type="text"
                placeholder="Smith"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-12 px-4 rounded-[14px] placeholder:text-[#0A0A0A80] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Email address
              </label>
              <input
                type="email"
                placeholder="alice@provider.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-[14px] placeholder:text-[#0A0A0A80] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Phone number
              </label>
              <input
                type="tel"
                placeholder="+12025550101"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-12 px-4 rounded-[14px] placeholder:text-[#0A0A0A80] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password123!"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 rounded-[14px] placeholder:text-[#0A0A0A80] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Specialty
              </label>
              <input
                type="text"
                placeholder="Psychiatry"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full h-12 px-4 rounded-[14px] placeholder:text-[#0A0A0A80] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                License number
              </label>
              <input
                type="text"
                placeholder="LIC123456"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full h-12 px-4 rounded-[14px] placeholder:text-[#0A0A0A80] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Experience (years)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="10"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full h-12 px-4 rounded-[14px] placeholder:text-[#0A0A0A80] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {formError ? (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-[48px] rounded-[14px] text-white font-semibold text-lg bg-[linear-gradient(256.76deg,#219580_18.35%,#346079_55.12%)] shadow-lg"
          >
            {registerMutation.isPending
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="text-center mt-8 text-[#4A5565] text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/provider-login")}
            className="text-[#219580] font-medium"
          >
            Login
          </button>
        </p>
      </div>

      <p className="text-center mt-4 text-sm text-[#6A7282]">
        Your information is secure and encrypted
      </p>
    </div>
  );
}
