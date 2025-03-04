
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <img
              src="https://scontent.fcgy1-3.fna.fbcdn.net/v/t39.30808-6/461570622_558172736903282_5599733805105509082_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFncftE4VvhujOAyF7tIBSUBMT_jFIeqikExP-MUh6qKaJnIm53lAsrz6ktTkaMwKQjRqx4UKVqNTwiNBBpIz4n&_nc_ohc=HR6VJeCwHNsQ7kNvgEOYhCv&_nc_oc=Adi7i-3pYDcKdssv7H5YBAMWlwmIKyVyF880cl5ABrozEO_faNtzv0tqfXvAU1qLz4c&_nc_zt=23&_nc_ht=scontent.fcgy1-3.fna&_nc_gid=A-hIMJICqztt26kLUXVJIcE&oh=00_AYA2rK1r0VBgUkYJ-gbTk3ZahE2p_Lwva15IgmStAaIIyw&oe=67CCE432"
              alt="UNVAS Logo"
              className="w-24 h-24 object-contain mb-4"
            />
            <span className="text-xl font-bold">UNVAS®</span>
          </div>

          <div className="text-center md:text-left">
            <h3 className="font-semibold text-lg mb-4">LINKS</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-primary">Home</Link></li>
              <li><Link to="/achievements" className="hover:text-primary">Achievements</Link></li>
              <li><Link to="/products" className="hover:text-primary">Products</Link></li>
              <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h3 className="font-semibold text-lg mb-4">CONTACT US</h3>
            <div className="space-y-2 text-sm">
              <p>Alta Tierra, Tiguma,</p>
              <p>Pagadian City, Philippines, 7016</p>
              <p>projectuplift21@gmail.com</p>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h3 className="font-semibold text-lg mb-4">FOLLOW US</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="https://web.facebook.com/ProjectUPliftZDS"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <span className="hover:text-primary cursor-not-allowed">
                <Instagram className="h-6 w-6" />
              </span>
              <span className="hover:text-primary cursor-not-allowed">
                <Twitter className="h-6 w-6" />
              </span>
              <span className="hover:text-primary cursor-not-allowed">
                <Youtube className="h-6 w-6" />
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 pt-8 border-t">
          <p>© 2025 UNVAS® Organization. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
