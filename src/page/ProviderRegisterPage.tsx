import bgImage from "../assets/images/bgimg.svg";
import Logo from "../assets/images/logo.svg";
import RegisterCard from "../components/auth/RegisterCard";
import { useNavigate } from "react-router";

export default function ProviderRegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[linear-gradient(180deg,#F0F9F7_0%,#E8F4F8_100%)] min-h-screen w-full">
      <div
        className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center lg:px-6 px-3 w-full py-8"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div
          className="flex items-center gap-3 mb-[30px] cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={Logo} alt="Logo" className="h-[50px]" />
        </div>

        <RegisterCard />
      </div>
    </div>
  );
}
