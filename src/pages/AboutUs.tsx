import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Story content with slides
const storySlides = [
  {
    id: 1,
    title: "Our Story",
    subtitle: "Highlights of Trials and Triumphs",
    content: null,
    image: "/lovable-uploads/unvaspic.jpg"
  },
  {
    id: 2,
    content: (
      <>
        <span className="font-semibold text-green-800">In the middle of the pandemic, Jimmy Sorabia</span>, a former Overseas Filipino Worker, noticed a pile of "unas" or dried banana leaves in his backyard, which he thought can be upcycled and can become a source of livelihood. Jimmy called DOST, where he was referred to me since I was working on a <span className="font-semibold text-green-800">DOST-funded project on bioplastics from agricultural wastes</span> while concurrently collaborating with Persons Deprived of Liberty in creating handmade papers as a source of livelihood. This started UNVAS, a brand with registered trademark, offering paper-based materials and products generated from dried banana leaves.
      </>
    ),
    image: "/lovable-uploads/unvaspic.jpg"
  },
  {
    id: 3,
    content: (
      <>
        After thorough research, I have learned that there are <span className="font-semibold text-green-800">444,000 hectares of banana plantations</span> in the Philippines, which can generate around <span className="font-semibold text-green-800">2.66 Billion kg of dried banana leaves</span> in a span of six months, with the <span className="font-semibold text-green-800">island of Mindanao ranking first as the top-producing area</span>. This voluminous amount of dried banana leaves is usually burnt or left to degrade on its own, thereby releasing harmful chemicals in the process.
      </>
    ),
    image: "/lovable-uploads/unvaspic.jpg"
  },
  {
    id: 4,
    content: (
      <>
        The idea of upcycling dried banana leaves presented livelihood opportunities, while addressing the pressing problem of pollution. Hence, I have considered the request of Mr. Sorabia as it is aligned to my personal advocacy and purpose of developing value-added products that could contribute to financial stability and community resilience. This started <span className="font-semibold text-green-800">UNVAS</span>, a brand with registered trademark, offering paper-based materials and products generated from dried banana leaves.
      </>
    ),
    image: "/lovable-uploads/unvaspic.jpg"
  },
  {
    id: 5,
    content: (
      <>
        The heart and core of UNVAS is that <span className="font-semibold text-green-800">it provides income among the partner communities of PAGBAYAW Inc.</span>, a nonprofit organization committed to provide technology-based livelihood among marginal communities in the Philippines.
      </>
    ),
    image: "/lovable-uploads/unvaspic.jpg"
  },
  {
    id: 6,
    content: (
      <>
        <span className="font-semibold text-green-800">UNVAS</span> became the primary material sold for income generation not only to the members of the <span className="font-semibold text-green-800">Sagun Farmers Producers Cooperative</span>—the cooperative of Mr. Sorabia but also other communities such as <span className="font-semibold text-green-800">Persons Deprived of Liberty</span> from Pagadian City Jail Female Dormitory, <span className="font-semibold text-green-800">working youth</span> from Western Mindanao State University Pagadian Campus, a group of <span className="font-semibold text-green-800">women from Liangan</span>, Vincenzo Sagun, Zamboanga del Sur, and very recently, the <span className="font-semibold text-green-800">Women of War in Matanog</span>, Maguindanao, Maguindanao del Norte. We also take pride that because of this invention, a <span className="font-semibold text-green-800">barangay ordinance prohibiting the burning of dried banana leaves</span> is now enforced at Maraya, Vincenzo Sagun, Zamboanga Del Sur.
      </>
    ),
    image: "/lovable-uploads/unvaspic.jpg"
  },
  {
    id: 7,
    content: (
      <>
        Initially, UNVAS or "unas," (local term for dried banana leaves) canvas, is sold as art canvas for students and artists in the province. A thinner version of unVas was sold as printing papers for schools and agencies needing special papers for certificates. unVas was further developed into beads and converted into accessories, home decors, and other wearable items. On its first year of production, <span className="font-semibold text-green-800">unVas was awarded "Best New Product" during the Zamboanga Peninsula Exposition 2022</span> hosted and organized by the Department of Trade and Industry IX.
      </>
    ),
    image: "/lovable-uploads/unvaspic.jpg"
  },
  {
    id: 8,
    content: (
      <>
        But aside from its authenticity and uniqueness, what's even more special about this project is that <span className="font-semibold text-green-800">each community is assigned with a different task</span>, which means that every UNVAS accessory sold was collaboratively created by all the communities involved. For instance, the conversion of dried banana leaves to UNVAS is done by the Sagun Farmers Producers Cooperative, chaired by Mr. Sorabia. Half of the produced UNVAS are usually sold as art canvas, while the other half is forwarded to Persons Deprived of Liberty in Pagadian City Jail Female Dormitory for beads production.
      </>
    ),
    image: "/lovable-uploads/unvaspic.jpg"
  },
  {
    id: 9,
    title: "PAGBAYAW INCORPORATORS",
    content: (
      <div className="space-y-2">
        <p>Julienne Stephanie Fabie</p>
        <p>Christine Yambao</p>
        <p>Jessica Casimiro</p>
        <p>Jason Jao</p>
        <p>Noel Caibigan</p>
      </div>
    ),
    image: "/lovable-uploads/unvaspic0.jpg"
  }
];

// FAQ data
const faqData = [
  {
    category: "About UNVAS",
    questions: [
      {
        question: "What is UNVAS?",
        answer: "UNVAS is an eco-friendly art canvas and craft material made from upcycled dried banana leaves (locally known as 'unas'). It's a sustainable alternative to traditional canvas materials, created to provide livelihood to communities in the Philippines."
      },
      {
        question: "How is UNVAS made?",
        answer: "UNVAS is made by collecting dried banana leaves, processing them through several natural methods, and converting them into durable sheets that can be used for various purposes including art canvas and craft materials."
      },
      {
        question: "Is UNVAS eco-friendly?",
        answer: "Yes, UNVAS is 100% eco-friendly. It utilizes agricultural waste (dried banana leaves) that would otherwise be burned, reducing pollution and carbon emissions. The production process uses minimal chemicals and emphasizes sustainability."
      },
      {
        question: "What makes UNVAS different from other canvas materials?",
        answer: "UNVAS stands out because of its unique texture, sustainability, and social impact. Each UNVAS product directly contributes to community livelihood programs across the Philippines, particularly helping marginalized groups."
      },
      {
        question: "Can I use UNVAS for painting or crafting?",
        answer: "Absolutely! UNVAS works wonderfully for various art forms including acrylic painting, oil painting, and many types of crafts. Its unique texture adds character to artwork and creates distinctive results."
      }
    ]
  },
  {
    category: "Products",
    questions: [
      {
        question: "What kind of UNVAS products do you sell?",
        answer: "We offer a range of products including art canvas in various sizes, printing papers, handmade accessories like earrings and necklaces, home decorations, and raw materials for crafters who want to create their own designs."
      },
      {
        question: "Are all the products handmade?",
        answer: "Yes, all our products are handmade by different community groups across the Philippines, ensuring each item is unique and created with care. This also helps maximize the positive social impact of each purchase."
      },
      {
        question: "Can I request a custom design?",
        answer: "Yes, we accept custom orders for both individual pieces and bulk orders. Please contact us with your specific requirements, and we'll work with our artisan communities to create something special for you."
      },
      {
        question: "Do you offer gift sets or bundles?",
        answer: "Yes, we offer various gift sets and bundles, perfect for presents or as starter kits for those who want to try different UNVAS products. These bundles often come at a special price compared to buying individual items."
      }
    ]
  }
];

const FAQItem = ({ question, answer, isOpen, toggleFAQ }: { question: string; answer: string; isOpen: boolean; toggleFAQ: () => void }) => {
  return (
    <div className="border-b border-[#A8D0B9]/40 last:border-0">
      <button
        className="flex justify-between items-center w-full py-4 text-left font-medium"
        onClick={toggleFAQ}
      >
        <span className="text-[#5a3e2b]">{question}</span>
        {isOpen ? (
          <Minus className="h-4 w-4 text-[#6b8e68]" />
        ) : (
          <Plus className="h-4 w-4 text-[#6b8e68]" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-700 animate-in fade-in-0 duration-200">
          {answer}
        </div>
      )}
    </div>
  );
};

export default function AboutUs() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFAQs, setOpenFAQs] = useState<Record<string, boolean>>({});

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % storySlides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? storySlides.length - 1 : prev - 1));
  };

  const toggleFAQ = (category: string, index: number) => {
    const faqId = `${category}-${index}`;
    setOpenFAQs((prev) => ({
      ...prev,
      [faqId]: !prev[faqId]
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-[#A8D0B9]/20 to-white py-16">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#5a3e2b] mb-6">About UNVAS®</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Learn about our journey, our mission and the people who make UNVAS® a catalyst for positive change.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="relative rounded-lg overflow-hidden border border-[#A8D0B9]/30 shadow-lg bg-[#f7faf8]">
                {/* Story Carousel */}
                <div className="min-h-[500px] flex flex-col md:flex-row">
                  {/* Left: Image with leaf design */}
                  <div className="md:w-1/2 bg-[#A8D0B9]/10 flex items-center justify-center py-8 relative">
                    <img 
                      src="/lovable-uploads/unvaspic0.jpg" 
                      alt="UNVAS Background" 
                      className="absolute inset-0 w-full h-full object-cover opacity-20"
                    />
                    <div className="relative z-10">
                      <img 
                        src="/lovable-uploads/unvaspic.jpg" 
                        alt="PAGBAYAW Logo" 
                        className="w-32 h-32 object-contain mx-auto rounded-full" 
                      />
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="md:w-1/2 p-8 flex flex-col justify-center relative">
                    {storySlides[currentSlide].title && (
                      <h2 className="text-4xl font-bold text-[#5a3e2b] mb-2 text-center">
                        {storySlides[currentSlide].title}
                      </h2>
                    )}
                    
                    {storySlides[currentSlide].subtitle && (
                      <p className="text-xl text-[#6b8e68] mb-6 text-center">
                        {storySlides[currentSlide].subtitle}
                      </p>
                    )}
                    
                    <div className="bg-[#A8D0B9]/20 p-6 rounded-lg">
                      <div className="prose text-gray-700 max-w-none">
                        {storySlides[currentSlide].content}
                      </div>
                    </div>
                    
                    {/* Navigation Controls */}
                    <div className="flex justify-between mt-8">
                      <button 
                        onClick={goToPrevSlide}
                        className="p-2 rounded-full bg-[#A8D0B9] text-white hover:bg-[#6b8e68] transition-colors"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {storySlides.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                              currentSlide === index 
                                ? "bg-[#6b8e68] scale-125" 
                                : "bg-gray-300"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                      
                      <button 
                        onClick={goToNextSlide}
                        className="p-2 rounded-full bg-[#A8D0B9] text-white hover:bg-[#6b8e68] transition-colors"
                        aria-label="Next slide"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-12 bg-[#f7faf8]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-[#5a3e2b] mb-10 text-center">Frequently Asked Questions</h2>
              
              <div className="space-y-8">
                {faqData.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="bg-white rounded-lg shadow-md overflow-hidden border border-[#A8D0B9]/30">
                    <h3 className="text-xl font-semibold p-4 bg-[#A8D0B9]/20 text-[#5a3e2b]">{category.category}</h3>
                    <div className="divide-y divide-[#A8D0B9]/20 px-4">
                      {category.questions.map((faq, index) => (
                        <FAQItem 
                          key={index}
                          question={faq.question}
                          answer={faq.answer}
                          isOpen={!!openFAQs[`${category.category}-${index}`]}
                          toggleFAQ={() => toggleFAQ(category.category, index)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Founder Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-[#5a3e2b] mb-8">Founder's Message</h2>
              
              <div className="bg-[#f7faf8] p-8 rounded-lg shadow-md border border-[#A8D0B9]/30">
                <blockquote className="italic text-gray-700 mb-6 text-lg">
                  "We hope that more Filipino people will join us in revolutionizing sustainable livelihood by supporting UNVAS. Together, we can empower marginal communities in the Philippines, reduce waste, and create a greener future."
                </blockquote>
                
                <div className="flex flex-col items-center">
                  <p className="font-semibold text-[#6b8e68] text-lg">Julienne Stephanie Fabie</p>
                  <p className="text-sm text-gray-600">Managing Director, PAGBAYAW Inc.</p>
                  <p className="text-sm text-gray-600">Associate Professor, Western Mindanao State University</p>
                  <p className="text-sm text-gray-600">Inventor, UNVAS</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
