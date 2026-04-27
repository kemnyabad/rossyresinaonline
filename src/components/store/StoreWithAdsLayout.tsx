import { ReactNode } from "react";
import StoreAdsSidebar from "./StoreAdsSidebar";

interface StoreWithAdsLayoutProps {
  children: ReactNode;
  className?: string;
}

const StoreWithAdsLayout = ({ children, className = "" }: StoreWithAdsLayoutProps) => {
  return (
    <div
      className={`mx-auto max-w-screen-2xl px-4 md:px-6 lg:grid lg:grid-cols-[238px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[268px_minmax(0,1fr)] ${className}`}
    >
      <StoreAdsSidebar />
      <div className="min-w-0">{children}</div>
    </div>
  );
};

export default StoreWithAdsLayout;
