import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GradientButton from "@/components/ui/GradientButton";

const images = [
  "https://scontent.fcgy1-3.fna.fbcdn.net/v/t39.30808-6/461570622_558172736903282_5599733805105509082_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFncftE4VvhujOAyF7tIBSUBMT_jFIeqikExP-MUh6qKaJnIm53lAsrz6ktTkaMwKQjRqx4UKVqNTwiNBBpIz4n&_nc_ohc=-zJ-zwE7t-wQ7kNvgEIETfW&_nc_oc=AdmN7cLZGA-C8DpGwjdyUdPtgKcWaZqlIgCkq0pYyWe3gWhjxgwxlkqT3ZyjJuUkXLo&_nc_zt=23&_nc_ht=scontent.fcgy1-3.fna&_nc_gid=HBUrfyL74p-OnNavNDbO-A&oh=00_AYG9YI7MrWUimzgkVXtbf0F9d0zWWiTJoqZN3iRMgITf5g&oe=67E31572",
  "https://scontent.fcgy1-1.fna.fbcdn.net/v/t39.30808-6/481111499_687559117297976_6580121354164409343_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeH3lC_Un1rmwYpSF4TXrSQ7BRDhKFFmrZsFEOEoUWatm0xy7G4C8yHLcBcOiuiOuecSgqcDBVx0y9-L3vVQ-bd5&_nc_ohc=tdsu8TpwbloQ7kNvgHhmzl9&_nc_oc=AdlT2rSjBRCY4w8PmJytBxZwr6PEqeF0GxV0miQdQwNg5qLZwTTviyqPYa57KueBRWM&_nc_zt=23&_nc_ht=scontent.fcgy1-1.fna&_nc_gid=_sotdmChql6ky8RH6UNDUA&oh=00_AYGta_JeGVA4TQ4xB_fUlRRt6gf1muEn6y8znk063LKjIQ&oe=67E31F03",
  "https://scontent.fcgy1-3.fna.fbcdn.net/v/t39.30808-6/464192211_580184221368800_4871165117159617129_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeH6LhYXK-oCXEgstq_TDCuDgzmMfuiHlmeDOYx-6IeWZ9URXAksmwkWBC03xzHmA5FLgy8JUrQzlw3TF4O0mXQ-&_nc_ohc=EApPgRdTpikQ7kNvgGIrKpb&_nc_oc=AdlrMdUbwsAhZRV_qTvNgjSTjUUJg3-6oaokcQhxm1Tbfw6QQcgZNq7uaD4ppr_4ARU&_nc_zt=23&_nc_ht=scontent.fcgy1-3.fna&_nc_gid=pR7b7yHVsdKuM0xOcNSZiA&oh=00_AYE8n52dxs_rSeruDtNKR9Br6_EQpmjh1eha3mV_Wvzknw&oe=67E315AC",
  "https://scontent.fcgy1-2.fna.fbcdn.net/v/t39.30808-6/463794890_580184161368806_8389589456757494486_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFkh2f-cjYzLtS3IC2iSh7X4syH2lkd-_HizIfaWR378UkeVHzfDRkOUTMscqALlhL6x7egLrNnIcCmi-5ptpLt&_nc_ohc=LXWAcbiRI-AQ7kNvgHneEMh&_nc_oc=AdmXGAMys4lM_uld2pbSmwwMzceZ3VvEz3I59vqQp1Q6Cs7UR81VzgueXMXJcNeJfHk&_nc_zt=23&_nc_ht=scontent.fcgy1-2.fna&_nc_gid=9cn2pEjU5q0-osT5EopIBQ&oh=00_AYFebMrpeFh1j8dXL88LhHIopVbHFrkrc9yl2aB_-PlpiQ&oe=67E32185",
  "https://scontent.fmnl13-3.fna.fbcdn.net/v/t39.30808-6/480717004_674123088641579_2737950572537495578_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeESUOJ81gCkVx9WRrSnPwJMhv2o6LImz4mG_ajosibPiYWNpPZExQjwGvDzUCRveHfcFzUubfTGs-mcJXkqIW8w&_nc_ohc=ES1e7IUHMskQ7kNvgE3xSTT&_nc_oc=Adk5c_uk4DizT_XWVX4RZM5u3QGO0WIlzicGvOPATG80_V_T7c283UE_R8-nXPdfLxXpJh_sDlEOm1YpxmUSbpGg&_nc_zt=23&_nc_ht=scontent.fmnl13-3.fna&_nc_gid=rFIidOxmhVWXazubhDTo2Q&oh=00_AYEncagliohBGddTojYuF_brslfW3xjrkt4O7xT_jQKHIw&oe=67E315E7",
  "https://scontent.fcgy1-3.fna.fbcdn.net/v/t39.30808-6/461487957_558179860235903_8982234205433000556_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeE--No4T1ugh53TuW8T45dhZCgTZ-xhavBkKBNn7GFq8OtXwXcA7gjknSiPzVlWmC5HSNdtwZwSXV0ZfLl9Yd7F&_nc_ohc=v0TUDTucmokQ7kNvgGHx76A&_nc_oc=AdmU1nzRVAPw8xjMn1XHD1ilc-S3LZ7fqmira__aaFVibTV6HGXcm1B1uLP4DvbLYzMBXy0h9gr6NjSENbUSOHJJ&_nc_zt=23&_nc_ht=scontent.fcgy1-3.fna&_nc_gid=3wpdN-mKyLsYHjxMIZhg6g&oh=00_AYGvcR1ywDMrKHAupd5AxHVu0D5i1VfPP35JlsbAuCNklg&oe=67E33396",
  "https://scontent.fcgy1-3.fna.fbcdn.net/v/t39.30808-6/463965155_580180428035846_7569502112032391939_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeGfKShRHPS19O4i7yROmvBs8m7OK7JEt2Dybs4rskS3YH0bKXQaEDkjX9eiokz_GPBNzW9m1Qh-9IdmfxapVqlD&_nc_ohc=ewxA19lw_mQQ7kNvgGl3Z7z&_nc_oc=AdnP4AhqOboK7ho5VpthLjCkvPmd5fPRYqRXSECupmdkhC0j-x0bKncuLzf5txqNE4Vw99C1CaleNuXytb61pfRU&_nc_zt=23&_nc_ht=scontent.fcgy1-3.fna&_nc_gid=l_Sev_BlM7SvfSTwN8UH2A&oh=00_AYGgh0tInXakeI0Uu44S0bG57bl2OMr8rU4IUNm9i83mHw&oe=67E331CD",
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
