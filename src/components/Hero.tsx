
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FDE1D3]">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: "url('https://scontent.fcgy1-2.fna.fbcdn.net/v/t39.30808-6/464386031_580184071368815_6580868332505955283_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFDTczecQwSIQAv8Foo4J9WklNLVXysIs2SU0tVfKwizbMbEZ_mpNNHneRc9qaStv41JwnbxG1UM8Z4GEQ8naSk&_nc_ohc=OUWPFHANl2wQ7kNvgEPoqOX&_nc_oc=AdiAh7d-F6Q9F3ue3lCVaAIzYjXmQpX4khSjQ9MXlNo4vi2IrdbHBl4OXr2DObt_HlU&_nc_zt=23&_nc_ht=scontent.fcgy1-2.fna&_nc_gid=ArDv50SBA3RV4P-SgS6Mg_e&oh=00_AYByaHbMqKjaQMbabCPppc11X03fDG2AjoL4tCzF1yAt1A&oe=67CCDFEF')"
        }}
      />
      
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-gray-900">
          PAGBAYAW INC.
        </h1>
        <p className="text-2xl md:text-3xl text-gray-700 mb-8 font-light">
          Supporting local artisans and sustainable craftsmanship
        </p>
        <Button
          size="lg"
          className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900"
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Learn More
        </Button>
      </div>
    </div>
  );
};

export default Hero;
