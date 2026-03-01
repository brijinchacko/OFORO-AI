import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
    </>
  );
}
