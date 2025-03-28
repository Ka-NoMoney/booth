"use client";

import { motion } from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight";
import LanguageSwitcher from "@/components/language-switcher";

export function Navbar() {
  return (
    <motion.nav
      className="relative flex w-full items-center justify-center overflow-hidden border-b bg-gradient-to-r from-rose-100 to-teal-100 p-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Spotlight className="top-10 left-0 md:-top-20 md:left-60" fill="white" />
      <div className="relative flex w-full max-w-xl items-center justify-center">
        <h1 className="relative z-10 flex items-center text-2xl font-bold tracking-tight text-gray-800">
          <span className="text-pink-500">@</span>Nguyễn Trọng Thảo
        </h1>

        <div className="absolute right-0">
          <LanguageSwitcher />
        </div>
      </div>
    </motion.nav>
  );
}
