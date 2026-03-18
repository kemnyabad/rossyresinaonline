import React, { ReactElement } from "react";
import { useRouter } from "next/router";
import Header from "./header/Header";
import BottomHeader from "./header/BottomHeader";
import Footer from "./Footer";
import TopBar from "./header/TopBar";

interface Props {
  children: ReactElement;
}

const RootLayout = ({ children }: Props) => {
  const router = useRouter();
  const hideBottomHeader = router.pathname === "/cart";
  return (
    <>
      <TopBar />
      <Header />
      {!hideBottomHeader && <BottomHeader />}
      {children}
      <Footer />
    </>
  );
};

export default RootLayout;
