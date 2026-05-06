import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../Header/Header.tsx";
import Footer from "../Footer/Footer.tsx";

interface AppLayoutProps {
  showFooter?: boolean;
}

function AppLayout({ showFooter = true }: AppLayoutProps) {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
      {showFooter && <Footer />}
    </>
  );
}

export default AppLayout;
