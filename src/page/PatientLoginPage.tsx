import bgImage from "../assets/images/bgimg.svg";
import Logo from "../assets/images/logo.svg";
import LoginCard from "../components/auth/LoginCard";
import { useNavigate } from "react-router";

export default function PatientLoginPage() {
  const navigate = useNavigate();
  return (
    <div className="bg-[linear-gradient(180deg,#F0F9F7_0%,#E8F4F8_100%)] min-h-screen w-full">
      <div
        className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center lg:px-6 px-3 w-full"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div
          className="flex items-center gap-3 mb-[40px] cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={Logo} alt="Logo" className="h-[50px]" />
        </div>
        <LoginCard role="Patient" onSubmitPath="/patient-dashboard" />
      </div>
    </div>
  );
}
