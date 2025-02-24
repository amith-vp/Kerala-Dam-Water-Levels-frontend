import React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedNumberProps) {
  const spring = useSpring(0, {
    stiffness: 300,
    damping: 30,   
    mass: 0.5,    
    restSpeed: 0.5 
  });

  const display = useTransform(spring, (current) => 
    `${prefix}${current.toFixed(decimals)}`
  );

  React.useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span className={className}>
      <motion.span>{display}</motion.span>
      <span className="text-[0.65em] opacity-40 ml-0.5">{suffix}</span>
    </motion.span>
  );
}