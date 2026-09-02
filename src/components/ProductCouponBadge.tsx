type ProductCouponBadgeProps = {
  compact?: boolean;
  prominent?: boolean;
  className?: string;
};

export default function ProductCouponBadge({ compact = false, prominent = false, className = "" }: ProductCouponBadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center overflow-hidden rounded-[4px] border border-[#74b600] bg-[#74b600] font-extrabold leading-none text-white shadow-[0_2px_5px_rgba(17,24,39,0.16)] ${
        prominent ? "text-sm md:text-base" : compact ? "w-full text-[11px] md:w-auto md:text-[11px]" : "text-xs md:text-[13px]"
      } ${className}`}
      title="Cupon WEB20: S/20 de descuento en compras desde S/100"
    >
      <span className={`flex min-w-0 flex-1 items-center gap-1 ${prominent ? "px-2.5 py-1.5" : "px-1.5 py-0.5 md:px-2 md:py-1"}`}>
        <span className={`flex shrink-0 items-center justify-center rounded-[2px] bg-[#ffd22e] font-black leading-none text-[#243000] ${
          prominent ? "h-5 w-5 text-[11px]" : "h-3.5 w-3.5 text-[9px] md:text-[10px]"
        }`}>
          S/
        </span>
        <span className="truncate tracking-normal md:tracking-[0.01em]">Cupón S/20 desde S/100</span>
      </span>
      <span className={`shrink-0 border-l border-white/40 bg-[#243000] font-black tracking-normal text-[#ffd22e] md:tracking-[0.02em] ${
        prominent ? "px-2.5 py-1.5" : "px-1 py-0.5 md:px-1.5 md:py-1"
      }`}>
        WEB20
      </span>
    </span>
  );
}
