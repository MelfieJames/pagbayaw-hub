import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GradientButton from "@/components/ui/GradientButton";

const images = [
  "https://scontent.fcgy1-1.fna.fbcdn.net/v/t39.30808-6/469048536_614830214570867_6370811006604467407_n.jpg?stp=c182.0.1685.1685a_dst-jpg_s206x206_tt6&_nc_cat=106&ccb=1-7&_nc_sid=92e838&_nc_eui2=AeHNXMQ-XC7HDVfLSoW7M8jO6si-vz229ZnqyL6_Pbb1maw6_Ucclfz4_bpDQGS0ff1KeL0qqv54sMgXrmAH-t_I&_nc_ohc=ECsn00BV6_MQ7kNvwHSzIiq&_nc_oc=AdkJpSG3ueuo6aMlYfBd7iSOzvks7ohmGcAxCkwTpxZYZRojl4H1kN1mhL_kkuKsMko&_nc_zt=23&_nc_ht=scontent.fcgy1-1.fna&_nc_gid=V-kpVA4K4_mLgulVEP337w&oh=00_AfHYgsiXpaw9PCCWtFm0pRanGatYofBBWVEmBCY4FnK8NA&oe=67FA3F8B",
  "https://scontent.fcgy1-3.fna.fbcdn.net/v/t39.30808-6/484956314_700660652654489_7280168493911710694_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHWqSyRf4WWY9roa0jp7EGnEZEVhtJe4lERkRWG0l7iUQc16rsYW5W8aufRxoEPZmbJcCdwmvQmWMPWIcLztzW2&_nc_ohc=LILls9FyDtUQ7kNvwHpadPF&_nc_oc=AdkJgPFwXyIQXJgGjdUQTkGsN8SUk5u1Q6WLT2-RiKWNkqCDj9NFl3CtdDqVfLFV_b4&_nc_zt=23&_nc_ht=scontent.fcgy1-3.fna&_nc_gid=jISMQldZhGlDq5F0uabe2w&oh=00_AfHGvwqaQnIQSVvx4j2cAcYddWvp-oTwGuL_YauOGw4Aag&oe=67FA2C96",
  "https://scontent.fcgy1-2.fna.fbcdn.net/v/t39.30808-6/488985513_718853227501898_2684993350779783719_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEcSeZ29SEv7Xs_7KqiWyiLiegYGrVdHv2J6BgatV0e_WE8_tbkRbX_c0nKl04Iw3mkRiYbkORyGux5veINPep_&_nc_ohc=AJOHB7jEcaEQ7kNvwEsvT6C&_nc_oc=AdnDVMGjbDBixSeiPzXDZnWHNzO1spBPe8F1XY8QTQgtkFplRD5cnCyJK4IeCXyKl0c&_nc_zt=23&_nc_ht=scontent.fcgy1-2.fna&_nc_gid=8AQZNk8AzhNkOFlglzwL_w&oh=00_AfHDogIiO_RFF4RaaNz3SnFrenipc2_ampKX_B2dpeMxGA&oe=67FA2592",
  "https://scontent.fcgy1-3.fna.fbcdn.net/v/t39.30808-6/464192211_580184221368800_4871165117159617129_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeH6LhYXK-oCXEgstq_TDCuDgzmMfuiHlmeDOYx-6IeWZ9URXAksmwkWBC03xzHmA5FLgy8JUrQzlw3TF4O0mXQ-&_nc_ohc=h4Ym7mjrzeIQ7kNvwFneKs0&_nc_oc=Adn2VCa4DuTzbD-yqEqWSbD8ndq0KO8vklzF8wFSGDaw2R35qOc6ncixQG-l8FZNSV4&_nc_zt=23&_nc_ht=scontent.fcgy1-3.fna&_nc_gid=vwv45SzV2PlmeJX9Ks-u3A&oh=00_AfFO2O_7Ovaim5v_Ot_KRQSBh4qOoFq8wTR0S4yHlH1m6w&oe=67FA27EC",
  "https://scontent.fcgy1-2.fna.fbcdn.net/v/t39.30808-6/463794890_580184161368806_8389589456757494486_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFkh2f-cjYzLtS3IC2iSh7X4syH2lkd-_HizIfaWR378UkeVHzfDRkOUTMscqALlhL6x7egLrNnIcCmi-5ptpLt&_nc_ohc=6wWUGchUdjEQ7kNvwGyy0Vk&_nc_oc=Adm-Hkr_iYUt9toNNLdFtQV530yuM-c7ftIhrVBAVB-D4pjeA2kchgwhHqRUU9mB-7s&_nc_zt=23&_nc_ht=scontent.fcgy1-2.fna&_nc_gid=VhquwiSt4sdulJrF8WFNWw&oh=00_AfE_1ExHNyaBJsu_4-cZbUTY-J22u1B0Obk-HJp_y5rgrA&oe=67FA33C5",
  "https://scontent.fcgy1-3.fna.fbcdn.net/v/t39.30808-6/461570622_558172736903282_5599733805105509082_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=110&ccb=1-7&_nc_sid=7a06f5&_nc_eui2=AeFncftE4VvhujOAyF7tIBSUBMT_jFIeqikExP-MUh6qKaJnIm53lAsrz6ktTkaMwKQjRqx4UKVqNTwiNBBpIz4n&_nc_ohc=yii1tOGFla0Q7kNvwEFjURd&_nc_oc=Admj0sWNf40cwltcTfHAX-ogBge9HA8WKvsik8lmwI5CAhN5JR3FhmsiZxBUdn4zR5Q&_nc_zt=23&_nc_ht=scontent.fcgy1-3.fna&_nc_gid=6qxAXtjTBJ9UxPktJ7UXQA&oh=00_AfE70zAUYpO4FKVEOhS2_WsPxUk0cQg2Zk3pRwBfnwEWZQ&oe=67FA27B2",
  "https://scontent.fcgy1-2.fna.fbcdn.net/v/t39.30808-6/480717004_674123088641579_2737950572537495578_n.jpg?stp=c62.0.837.837a_dst-jpg_s206x206_tt6&_nc_cat=101&ccb=1-7&_nc_sid=50ad20&_nc_eui2=AeESUOJ81gCkVx9WRrSnPwJMhv2o6LImz4mG_ajosibPiYWNpPZExQjwGvDzUCRveHfcFzUubfTGs-mcJXkqIW8w&_nc_ohc=Ef3KFxH2I3gQ7kNvwFypVlY&_nc_oc=AdlgCVl_ax-v1J3AiPhL1THrxW_w4byvN3_pKefgp6fX7TBDWE0WU13dHo1hl1VWk54&_nc_zt=23&_nc_ht=scontent.fcgy1-2.fna&_nc_gid=E4CEu9bJZrbJYioKb9dfdw&oh=00_AfHXrak8HW2ci133ZTlkFXfngfhFJuumCrc9xdQ4ott83Q&oe=67FA2827",
];

export default function Hero() {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    setPosition({ x: (clientX - window.innerWidth / 2) / 30, y: (clientY - window.innerHeight / 2) / 30 });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden">

      <div className="container mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="mb-6 inline-flex items-center px-3 py-1.5 rounded-full bg-green-200 text-xs font-medium tracking-wide text-green-700">
              Welcome to UNVAS®
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 text-[#5a3e2b]">
              PAGBAYAW INC.
            </h1>

            <p className="text-lg mb-10 max-w-lg mx-auto lg:mx-0 text-[#6b8e68]">
              Celebrating Filipino craftsmanship through sustainable and innovative products that showcase our cultural heritage.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <GradientButton
                size="lg"
                onClick={() => navigate("/achievements")}
                className="bg-[#8b5e3c] text-white hover:bg-[#6b4f3b]"
              >
                Our Achievements
              </GradientButton>

              <button
                className="inline-flex items-center text-sm font-medium px-5 py-3 text-[#5a3e2b] hover:text-[#6b8e68] transition-colors duration-200"
                onClick={() => navigate("/products")}
              >
                Our Products
                <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6.5 3.5L11 8L6.5 12.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Image with Animation and Smooth Carousel */}
<div
  className="flex-1 w-full max-w-xl mx-auto"
  onMouseMove={handleMouseMove}
  onMouseEnter={() => setHover(true)}
  onMouseLeave={() => setHover(false)}
>
  <div
    className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden shadow-lg transition-transform duration-300"
    style={{
      transform: hover ? `translate(${position.x}px, ${position.y}px)` : "translate(0,0)",
    }}
  >
    {/* Image Container with Smooth Transition */}
    <div className="relative w-full h-full">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt="Pagbayaw Inc. product showcase"
          className={`absolute inset-0 w-full h-full rounded-2xl object-cover transition-opacity duration-[1800ms] ease-in-out ${
            index === currentImage ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  </div>
</div>

        </div>
      </div>
    </section>
  );
}
