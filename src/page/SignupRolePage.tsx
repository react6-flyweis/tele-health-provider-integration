import bgImage from "../assets/images/bgimg.svg";
import RoleCard from "../components/auth/RoleCard";
import Logo from "../assets/images/logo.svg";
import { useNavigate } from "react-router";

export default function SignupRolePage() {
  const navigate = useNavigate();
  return (
    <div className="bg-[linear-gradient(180deg,#F0F9F7_0%,#E8F4F8_100%)] min-h-screen w-full">
      <div
        className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center lg:px-6 px-3 w-full"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={Logo} alt="Logo" className="h-[50px]" />
        </div>
        <div className="text-center my-10">
          <h2 className="text-4xl font-bold text-[#1E2939]">Login as</h2>
          <p className="text-[#4A5565] text-lg">Select your role to continue</p>
        </div>

        <div className="flex flex-wrap gap-6 justify-center w-full">
          <RoleCard role="patient" path="/patient-login" />
          <RoleCard role="provider" path="/provider-login" />
        </div>
      </div>
    </div>
  );
}
