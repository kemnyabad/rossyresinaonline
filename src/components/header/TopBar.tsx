import { BiCaretDown } from "react-icons/bi";

const TopBar = () => {
  return (
    <div className="w-full bg-amazon_light text-gray-200 text-xs hidden md:block border-b border-white/10">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between py-2 gap-4">
          <div className="flex-1">
            <span>Bienvenidos a Rossy Resina · Envíos a todo Perú · Promociones semanales</span>
          </div>
          <div className="flex items-center gap-4 whitespace-nowrap">
            <button className="inline-flex items-center gap-1 hover:text-white">
              Español <BiCaretDown />
            </button>
            <span className="text-white/40">|</span>
            <button className="inline-flex items-center gap-1 hover:text-white">
              PEN (S/) <BiCaretDown />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
