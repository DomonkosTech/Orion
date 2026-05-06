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
      <Outlet />
      {showFooter && <Footer />}
    </>
  );
}

export default AppLayout;
