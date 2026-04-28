import { useNavigate } from "react-router";
import { Heart, Stethoscope } from "lucide-react";
import { useState } from "react";

type Props = {
  role: "patient" | "provider";
  path: string;
};

export default function RoleCard({ role }: Props) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const isPatient = role === "patient";

  const title = isPatient ? "Patient" : "Provider";
  const description = isPatient
    ? "Access your, appointments, and prescriptions"
    : "Manage appointments, patients, and consultations";

const handleClick = () => {
  if (role === "patient") {
    window.location.href = "https://mr-railu-medical-user-website-mauve.vercel.app/patient-login";
  } else {
    navigate(`/${role}-login`);
  }
};

  const Icon = isPatient ? Heart : Stethoscope;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-[16px] max-w-[363px] w-full p-10 shadow-[0px_3.9px_5.86px_-3.9px_#0000001A,0px_9.76px_14.64px_-2.93px_#0000001A] cursor-pointer text-center transition-all duration-300 hover:shadow-xl"
    >
      <div
        className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
          hovered
            ? "bg-[linear-gradient(256.76deg,#219580_18.35%,#346079_55.12%)]"
            : "bg-[#F3F4F6]"
        }`}
      >
        <Icon
          size={32}
          className={`${hovered ? "text-white" : "text-gray-600"}`}
        />
      </div>

      <h3 className="text-[24px] font-bold mt-6 text-[#1E2939]">{title}</h3>

      <p className="text-[#4A5565] mt-3 mb-8">{description}</p>

      <button
        onClick={handleClick}
        className={`w-full h-[52px] rounded-[14px] font-bold  text-base transition-all duration-300 ${
          hovered
            ? "bg-[linear-gradient(256.76deg,#219580_18.35%,#346079_55.12%)] text-white shadow-lg"
            : "bg-[#F3F4F6] text-[#364153]"
        }`}
      >
        Continue as {title}
      </button>
    </div>
  );
}
