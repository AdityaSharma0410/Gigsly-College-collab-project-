"use client";
import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import CustomCursor from '@/components/CustomCursor';
import WaterDroplets from '@/components/WaterDroplets';
import Footer from '@/components/Footer';

export default function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      <WaterDroplets />
      <CustomCursor />
      <div className="flex flex-col min-h-screen">
        <main id="main-content" className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ width: "100%" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </>
  );
} 