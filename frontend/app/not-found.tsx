"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { TriVisionXLogo } from "@/components/TriVisionXLogo";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-muted dark:bg-[#121212] overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-violet-500/10 to-blue-500/10 blur-3xl rounded-full opacity-50 pointer-events-none" />

      <div className="z-10 flex flex-col items-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <TriVisionXLogo size="xl" glow animate={false} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-7xl sm:text-9xl font-black tracking-tighter text-foreground text-foreground mb-4 drop-shadow-sm"
        >
          4<span className="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">0</span>4
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-200 mb-4"
        >
          Lost in the knowledge base?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="max-w-md text-[15px] text-muted-foreground text-muted-foreground mb-8 leading-relaxed"
        >
          The page or document you're looking for doesn't exist, has been moved, or you don't have access to it. Let's get you back on track.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-foreground shadow-lg shadow-violet-500/25 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="rounded-full w-full sm:w-auto">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
