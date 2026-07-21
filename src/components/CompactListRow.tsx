import React, { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompactRowProps {
  title: string;
  primaryMetric: string;
  status: string;
  statusClassName?: string;
  details: React.ReactNode;
}

export default function CompactListRow({ title, primaryMetric, status, statusClassName, details }: CompactRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#1a1210]/60 border border-viking-gold/20 rounded-xl overflow-hidden mb-2 transition-colors hover:border-viking-gold/40">
      {/* Trigger Row */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-viking-gold/50 cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-viking-gold/10 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-viking-gold" />
          </div>
          <div className="truncate">
            <h4 className="text-white font-bold text-sm truncate">{title}</h4>
            <span className="text-[10px] text-viking-silver uppercase tracking-widest">{primaryMetric}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${statusClassName || 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            {status}
          </span>
          <ChevronDown className={`w-4 h-4 text-viking-silver transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="border-t border-viking-gold/10"
          >
            <div className="p-4 text-sm text-viking-silver">
              {details}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
