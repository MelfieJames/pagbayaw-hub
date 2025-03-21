import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GradientButton from "@/components/ui/GradientButton";

const images = [
  "https://scontent.fcgy1-2.fna.fbcdn.net/v/t39.30808-6/464386031_580184071368815_6580868332505955283_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFDTczecQwSIQAv8Foo4J9WklNLVXysIs2SU0tVfKwizbMbEZ_mpNNHneRc9qaStv41JwnbxG1UM8Z4GEQ8naSk&_nc_ohc=9epGtF4rHHYQ7kNvgHGlxwU&_nc_oc=Adj287KDLPFntD5AL6xrE-WswrQsGawxBKQ77QpH_wmp-NsbSkCnqpFPxkwIgzq7D8Q&_nc_zt=23&_nc_ht=scontent.fcgy1-2.fna&_nc_gid=ANKFmF7avCbvVtnJPq06A8a&oh=00_AYE9ROqX2d-Sn5qnf_FA8iwNFZakzTGNPbGIt_RZbJDExg&oe=67DA0EEF",
  "https://scontent.fcgy1-3.fna.fbcdn.net/v/t39.30808-6/482019888_691444456909442_96008749743154511_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeGlE2Xp76PuStwTdk-za6q1uNinhOuYGy242KeE65gbLfA3Lp3-sTcXv9-qYfszVyJgg2k9PMhU9_uZSe0SuWJi&_nc_ohc=W3wibyK-tDQQ7kNvgFQ8hQI&_nc_oc=AdhLugIMIoqhmLNo7c5J1e8mEfYDJM0R5s_1lgnkLwdwNmyI474ErWbcq8ciXFfS71M&_nc_zt=23&_nc_ht=scontent.fcgy1-3.fna&_nc_gid=eXGtD3c7cCrnlRLTaTg5WQ&oh=00_AYFj25aFgzGN-ksAo3b7zjaxiB1XmwJYgfk-D4qUdCMw6Q&oe=67DA23EC",
  "https://scontent.fcgy1-3.fna.fbcdn.net/v/t39.30808-6/481795601_684847247569163_2128918297598396703_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeEZY4ja4T2RzycgbEWVEnY_OT7KVAuwO-k5PspUC7A76U-2sMCvWHLaoRu_aDK1eiqNvovCjtpm-bG4igMvl3mx&_nc_ohc=ieN1EIGnDJ4Q7kNvgHrogc-&_nc_oc=AdjESSbrL7YKkhII6aSax3irQF5v8Iixw0Plb-HVGoar8Nfb05z9UdCcw8zYRg5SZoM&_nc_zt=23&_nc_ht=scontent.fcgy1-3.fna&_nc_gid=AZrhsArwiLGwW31Yo3Jnyg&oh=00_AYEI9YDYOx239ifoQDHCZWnEEnyuszC7NK3ZHa5-vtHwpQ&oe=67DA2756",
  "https://scontent.fcgy1-2.fna.fbcdn.net/v/t39.30808-6/464927041_583907577663131_8947994045915117909_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeF9sy_-aDDcyvODjlDdDo3-TfFIyli3ac9N8UjKWLdpz71dOzWLgurPBEC90svrCMt6zRmwa9h__N9ueYHuOYKG&_nc_ohc=NS6sV0fXUnQQ7kNvgGcjK7L&_nc_oc=Adgj__P7gDi2OT8Z0LogN0Umwu8qsZx_0xW29OVHbgr2VKFndPVo1QcKiVzS7BmNudM&_nc_zt=23&_nc_ht=scontent.fcgy1-2.fna&_nc_gid=AaDfWYnd88r23SbgYYLB91B&oh=00_AYF-4cK517rhHXjTqYG5uP6OmkFHw-FDb2Wy7i_wqw5SLQ&oe=67DA4ED4",
  "https://scontent.fcgy1-1.fna.fbcdn.net/v/t39.30808-6/481111499_687559117297976_6580121354164409343_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeH3lC_Un1rmwYpSF4TXrSQ7BRDhKFFmrZsFEOEoUWatm0xy7G4C8yHLcBcOiuiOuecSgqcDBVx0y9-L3vVQ-bd5&_nc_ohc=hvGN_IU5CucQ7kNvgHChSMJ&_nc_oc=AdjTl1Q3LuGb5l9rc2chMs3NhuxWaAAzwXzyE2xZQf2MhyfV8fYonBT77-poBph0YXg&_nc_zt=23&_nc_ht=scontent.fcgy1-1.fna&_nc_gid=AKxBNy5ZcCCxHyPRWSQt8Z5&oh=00_AYFN54y9yZJ8Yt_lkoTYyeze23A63JR24J7Z3aKZ0vpOvQ&oe=67DA1CC3",
  "https://scontent.fcgy1-3.fna.fbcdn.net/v/t39.30808-6/464192211_580184221368800_4871165117159617129_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeH6LhYXK-oCXEgstq_TDCuDgzmMfuiHlmeDOYx-6IeWZ9URXAksmwkWBC03xzHmA5FLgy8JUrQzlw3TF4O0mXQ-&_nc_ohc=YYI1iktGVM0Q7kNvgFQVsTv&_nc_oc=Adiz-mq4HhiJfyOQmFg85S8404xy6jZBpj4mJHZk2f66ti5cnv46zJefpT5aYwphnL4&_nc_zt=23&_nc_ht=scontent.fcgy1-3.fna&_nc_gid=LyNwK6Kontk5Iq6TKCJLtQ&oh=00_AYHvrmgyX16V6hegodpGiKH3uX3JJAWzt3sTkpAl0pFKDQ&oe=67DA4BAC",
  "https://scontent.fcgy1-2.fna.fbcdn.net/v/t39.30808-6/464292977_580136818040207_3192040648273356938_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=101&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHYtKDHI5uXR_mY7BebkGNCHsCtIi_jkZMewK0iL-ORkzlZTgH92lhajry2RcdrNAX5cIhZMd2_juwNRtjkckK1&_nc_ohc=2nfKoXH3GTcQ7kNvgEYOPGF&_nc_oc=AdhuIpFr9B6cDK7tJDCu6mbzWzKZ9rKKl1_HaOUx-lHAcVIfSHmERZ99yFVcDv8Y2BQ&_nc_zt=23&_nc_ht=scontent.fcgy1-2.fna&_nc_gid=eRtwQuYFy0GBu7EJQyjzOA&oh=00_AYEOuyiOrVzFtPvXmYIZY6AL9ehYrS0CNFrDJdxZrm4OSA&oe=67DA2471",
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
