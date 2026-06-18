"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TriVisionXLogo } from "./TriVisionXLogo";

const footerLinks = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap", "API"],
  Resources: ["Documentation", "Guides", "Blog", "Community", "Templates"],
  Company: ["About", "Careers", "Press", "Partners", "Contact"],
  Legal: ["Privacy", "Terms", "Security", "Cookies", "Licenses"],
};

export function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer ref={ref} className="border-t border-zinc-900 bg-zinc-950 relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute left-1/4 bottom-0 w-[400px] h-[300px] rounded-full blur-[120px] opacity-[0.02]"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, #3b82f6 50%, transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-8"
        >
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <a href="#" className="flex items-center gap-2">
              <TriVisionXLogo size="sm" shimmer={true} glow={true} showWordmark={true} animate={false} />
            </a>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Enterprise-grade multi-agent orchestration and context retrieval engines.
            </p>
            {/* System Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/80 text-[9px] font-mono tracking-wider text-zinc-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>SYSTEMS OPERATIONAL</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-zinc-500 hover:text-purple-400 dark:text-zinc-400 dark:hover:text-purple-400 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 pt-8 border-t border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-zinc-500 font-mono">
            &copy; {new Date().getFullYear()} TriVisionX, Inc. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/sopanmunde/trivisionx-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-purple-400 dark:text-zinc-400 dark:hover:text-purple-400 transition-colors font-mono"
            >
              GitHub
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
