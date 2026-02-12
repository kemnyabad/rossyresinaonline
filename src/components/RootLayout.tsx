import React, { ReactElement } from "react";
import Header from "./header/Header";
import BottomHeader from "./header/BottomHeader";
import Footer from "./Footer";
import TopBar from "./header/TopBar";

interface Props {
  children: ReactElement;
}

const RootLayout = ({ children }: Props) => {
  return (
    <>
      <TopBar />
      <Header />
      <BottomHeader />
      {children}
      <a
        href="https://wa.me/51966357648"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full bg-brand_green text-black px-4 py-3 shadow-lg hover:brightness-95"
        aria-label="Abrir WhatsApp"
      >
        <span className="text-base font-semibold">WhatsApp</span>
      </a>
      <Footer />
    </>
  );
};

export default RootLayout;
