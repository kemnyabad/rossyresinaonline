const TopBar = () => {
  return (
    <div className="w-full bg-amazon_light text-gray-200 text-xs hidden md:block border-b border-white/10">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-center py-2">
          <span className="text-sm font-semibold tracking-wide text-white">
            Bienvenidos a Rossy Resina
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
