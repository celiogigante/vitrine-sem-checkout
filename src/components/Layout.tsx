import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import FloatingFooterBar from "./FloatingFooterBar";

const Layout = () => (
  <div className="flex min-h-screen flex-col pb-20">
    <Header />
    <main className="flex-1" style={{ backgroundColor: '#3A3A32' }}>
      <Outlet />
    </main>
    <Footer />
    <FloatingFooterBar />
  </div>
);

export default Layout;
