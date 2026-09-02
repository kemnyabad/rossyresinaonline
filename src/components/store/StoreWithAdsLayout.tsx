import { ReactNode } from "react";

interface StoreWithAdsLayoutProps {
  children: ReactNode;
  className?: string;
}

const StoreWithAdsLayout = ({ children, className = "" }: StoreWithAdsLayoutProps) => {
  return (
    <div
      className={`mx-auto max-w-screen-2xl px-4 md:px-6 ${className}`}
    >
      <div className="min-w-0">{children}</div>
    </div>
  );
};

export default StoreWithAdsLayout;
