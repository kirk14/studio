"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlayCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 sm:p-8 mt-20 sm:mt-0">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-primary-foreground bg-primary/20 border border-primary/30 rounded-full"
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-primary">AI-Powered Nutrition Revolution</span>
      </motion.div>

      <motion.h1 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeInOut" }}
        className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary pb-4"
      >
        Transform Your Health
        <br />
        With AI Precision
      </motion.h1>

      <motion.p 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.4, ease: "easeInOut" }}
        className="max-w-2xl mt-4 text-lg text-muted-foreground"
      >
        Experience the future of personalized nutrition. Our advanced AI creates{" "}
        <span className="text-primary/80 font-semibold">hyper-personalized meal plans</span> that adapt to your lifestyle,
        preferences, and goals—delivering results that actually last.
      </motion.p>

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.6, ease: "easeInOut" }}
        className="flex flex-col sm:flex-row items-center gap-4 mt-8"
      >
        <Link href="/auth">
            <Button size="lg" className="w-full sm:w-auto [filter:drop-shadow(0_0_6px_hsl(var(--primary)/0.8))]">
                Start Your Journey <Sparkles className="ml-2 h-4 w-4" />
            </Button>
        </Link>
        <Button size="lg" variant="outline" className="w-full sm:w-auto">
            <PlayCircle className="mr-2 h-4 w-4"/>
            Watch Demo
        </Button>
      </motion.div>
    </div>
  );
}
