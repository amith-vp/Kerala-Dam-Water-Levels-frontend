import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DamSource } from '@/types/dam';

interface DamMarkerProps {
  damName: string;
  waterLevel: number;
  source?: DamSource;
  isCollapsed?: boolean;
}

const DamMarker = ({ damName = "test", waterLevel = 75, source = "KSEB", isCollapsed = false }: DamMarkerProps) => {
  const getWaterColor = (level: number) => {
    if (level < 20) return "#90EE9080";
    if (level < 40) return "#ADFF2F80";
    if (level < 60) return "#FFFF0080";
    if (level < 80) return "#FFA50080";
    return "#FF000080";
  };

  const sourceAccent = source === "Irrigation"
    ? { color: "#0f766e", shortLabel: "I", label: "Irrigation" }
    : { color: "#2563eb", shortLabel: "K", label: "KSEB" };

  return (
    <motion.div 
      className="dam-marker relative group inline-block cursor-pointer"
      initial={{ opacity: 0, scale: 0.95, width: '2rem' }}
      animate={{ opacity: 1, scale: 1, width: 'auto' }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div 
        className={`flex items-center rounded`}
        layout
      >
        {/* Circle */}
        <motion.div 
          className="relative flex-shrink-0 bg-white rounded-full shadow-md"
          style={{ width: '2rem', height: '2rem' }}
        >
          <svg viewBox="0 0 40 40" width="100%" height="100%">
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="rgba(240, 240, 240, 0.5)"
              strokeWidth="3"
            />
            
            <motion.circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke={getWaterColor(waterLevel)}
              strokeWidth="3"
              strokeDasharray={`${waterLevel}, 100`}
              transform="rotate(-90 20 20)"
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${waterLevel}, 100` }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
            />

            <motion.text
              x="20"
              y="24"
              textAnchor="middle"
              className="font-jetbrains font-extrabold text-sm tracking-tight"
              fill="#00000"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.3 }}
            >
              {`${waterLevel.toFixed(0)}%`}
            </motion.text>
          </svg>
          <motion.div
            layout
            className="absolute -top-0.5 left-5 flex h-3.5 origin-left items-center justify-start overflow-hidden rounded-full bg-white/65 px-0.5 text-[7px] font-black leading-none shadow-sm backdrop-blur-[1px]"
            style={{ color: sourceAccent.color }}
            animate={{ minWidth: isCollapsed ? 12 : source === "Irrigation" ? 40 : 23 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            title={source}
            aria-label={`${source} dam`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isCollapsed ? sourceAccent.shortLabel : sourceAccent.label}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap"
              >
                {isCollapsed ? sourceAccent.shortLabel : sourceAccent.label}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </motion.div>
        
        {/* Dam Name */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              className="overflow-hidden"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="px-2 pb-0.5 pt-3 whitespace-nowrap">
                <p className="text-base font-jetbrains font-extrabold text-black tracking-tight">
                  {damName}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default DamMarker;
