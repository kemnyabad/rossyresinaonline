type ProductCouponBadgeProps = {
  compact?: boolean;
  className?: string;
};

export default function ProductCouponBadge({ compact = false, className = "" }: ProductCouponBadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center overflow-hidden rounded-[4px] border border-[#74b600] bg-[#74b600] font-extrabold leading-none text-white shadow-[0_2px_5px_rgba(17,24,39,0.16)] ${
        compact ? "text-[11px]" : "text-xs md:text-[13px]"
      } ${className}`}
      title="Cupon WEB20: S/20 de descuento en compras desde S/100"
    >
      <span className="flex min-w-0 items-center gap-1 px-2 py-1">
        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[2px] bg-[#ffd22e] text-[10px] font-black leading-none text-[#243000]">
          S/
        </span>
        <span className="truncate tracking-[0.01em]">Cupón S/20 desde S/100</span>
      </span>
      <span className="shrink-0 border-l border-white/40 bg-[#243000] px-1.5 py-1 font-black tracking-[0.02em] text-[#ffd22e]">
        WEB20
      </span>
    </span>
  );
}
