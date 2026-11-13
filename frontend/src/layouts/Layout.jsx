
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar />

      <div className="min-h-screen min-w-0 flex-1">
        <Navbar />

        <main className="w-full min-w-0 p-4 pt-20 sm:p-6 sm:pt-20 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
