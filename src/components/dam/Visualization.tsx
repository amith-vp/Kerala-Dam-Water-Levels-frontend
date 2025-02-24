import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useTheme } from "@/components/ui/theme-provider";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface VisualizationProps {
  data: any[];
  domain?: [number, number];
  currentIndex: number;
  onIndexChange?: (index: number) => void;
  damData: any; 
}

export function Visualization({ data, currentIndex, onIndexChange, damData }: VisualizationProps) {
  const { theme } = useTheme();
  const currentData = data[currentIndex] || data[data.length - 1];
  const waterLevel = parseFloat(currentData?.storagePercentage || "0");
  const hasRainfall = parseFloat(currentData?.rainfall || "0") > 0;

  const raindrops = useMemo(() => {
    if (!hasRainfall) return [];
    const rainfall = parseFloat(currentData?.rainfall || "0");
    const minDrops = 10;
    const maxDrops = 40;
    const count = Math.min(maxDrops, minDrops + Math.ceil(rainfall * 1.5));

    return Array.from({ length: count }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 0.4}s`,
      height: `${3 + (rainfall / 20 * Math.random() * 2)}vh`,
      key: i
    }));
  }, [hasRainfall, currentData?.rainfall]);

  const fixedStars = useMemo(() => Array.from({ length: 85 }).map((_, i) => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const prime1 = primes[i % primes.length];
    const prime2 = primes[(i + 7) % primes.length];

    return {
      x: 25 + ((i * phi * prime1) % 750), 
      y: 10 + ((i * phi * prime2) % 170), 
      size: 0.3 + (Math.sin(i * phi) + 1) * 0.8,
      brightness: 0.3 + (Math.cos(i * phi) + 1) * 0.3,
    };
  }), []); 

  const handleSliderChange = (value: number[]) => {
    onIndexChange?.(Math.round(value[0]));
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange?.(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      onIndexChange?.(currentIndex + 1);
    }
  };

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('.');
    return format(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)), 'MMM dd, yyyy');
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !data.length) return;
    
    const targetDate = format(date, 'dd.MM.yyyy');
    const newIndex = data.findIndex(item => item.date === targetDate);
    
    if (newIndex !== -1) {
      onIndexChange?.(newIndex);
    }
  };

  const currentDate = currentData?.date ? new Date(currentData.date.split('.').reverse().join('-')) : new Date();

  const availableDates = useMemo(() => {
    return data.map(item => new Date(item.date.split('.').reverse().join('-')));
  }, [data]);

  return (
    <Card className="glass-card h-full">
      <CardContent className="p-0 flex flex-col">
        <div className="flex-1 relative">
          <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="sky-gradient-light" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#87CEEB" />
                <stop offset="100%" stopColor="#E0F6FF" />
              </linearGradient>

              <linearGradient id="sky-gradient-dark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B1026" />
                {/* <stop offset="90%" stopColor="#1a1f35" /> */}
                {/* <stop offset="100%" stopColor="#2C3E50" /> */}
              </linearGradient>

              <radialGradient id="sun-gradient" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#FFE87C" />
                <stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="moon-gradient" cx="0.5" cy="0.5" r="0.4">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="water-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--dam-water))" stopOpacity="var(--dam-water-opacity)" />
                <stop offset="100%" stopColor="hsl(var(--dam-water))" stopOpacity={0.5} />
              </linearGradient>

              <radialGradient id="star-glow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>

              {/*  radial gradient - buoy light */}
              <radialGradient id="buoy-light-glow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#FF0000" stopOpacity="1" />
                <stop offset="40%" stopColor="#FF0000" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
              </radialGradient>

              {/* Cloud */}
              <path id="cloud-path"
                d="M0 0 
                   a10 10 0 0 1 20 0
                   a8 8 0 0 1 10 8
                   a8 8 0 0 1 -10 8
                   h-20
                   a10 10 0 0 1 0 -16
                   z" />
            </defs>

            {/* Sky bg */}
            <motion.rect
              x="0" y="0" width="800" height="400"
              initial={false}
              animate={{
                fill: theme === 'light' ? 'url(#sky-gradient-light)' : 'url(#sky-gradient-dark)'
              }}
              transition={{ duration: 0.5 }}
            />

            

            {/* Animated Clouds */}
            <g className="clouds">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.g
                  key={`cloud-${i}`}
                  initial={{ x: -100, y: 20 + i * 15 }}
                  animate={{
                    x: [800, -100],
                    opacity: [0, 0.8, 0.8, 0]
                  }}
                  transition={{
                    x: {
                      duration: 45 + i * 5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 12
                    },
                    opacity: {
                      duration: 45 + i * 5,
                      repeat: Infinity,
                      times: [0, 0.1, 0.9, 1],
                      delay: i * 12
                    }
                  }}
                >
                  <use
                    href="#cloud-path"
                    fill="hsl(var(--dam-cloud))"
                    opacity={0.8}
                    transform={`scale(${1 + i * 0.2})`}
                  />
                </motion.g>
              ))}
            </g>

            {/* Celestial bodies */}
            <AnimatePresence mode="sync" initial={false}>
              {theme === 'light' ? (
                <motion.g
                  key="sun"
                  initial={{ opacity: 0, y: 300 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 300 }}
                  transition={{
                    opacity: { duration: 0.5 },
                    y: { duration: 0.8 }
                  }}
                >
                  {/* Large glow */}
                  <circle cx="700" cy="60" r="35" fill="url(#sun-gradient)">
                    <animate
                      attributeName="r"
                      values="35;38;35"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Main sun body + pulse animation */}
                  <motion.circle
                    cx="700"
                    cy="60"
                    r="20"
                    fill="#FFE87C"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [1, 0.9, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Central core */}
                  <circle cx="700" cy="60" r="15" fill="#FFA500" />
                </motion.g>
              ) : (
                <motion.g
                  key="moon-and-stars"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.g
                    initial={{ opacity: 0, y: 300 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 300 }}
                    transition={{
                      opacity: { duration: 0.5 },
                      y: { duration: 0.8 }
                    }}
                  >
                    <circle cx="700" cy="60" r="25" fill="url(#moon-gradient)" />
                    <circle cx="700" cy="60" r="20" fill="#FFFFFF" />
                  </motion.g>

                  {/* Stars with fade */}
                  {fixedStars.map((star, i) => {
                    const distanceFromMoon = Math.sqrt(Math.pow(star.x - 700, 2) + Math.pow(star.y - 60, 2));
                    if (distanceFromMoon < 50) return null;

                    const isExtraBright = i % 7 === 0;
                    const delay = i * 0.01;

                    return (
                      <motion.g
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: delay
                        }}
                      >
                        {(star.size > 1.5 || isExtraBright) && (
                          <motion.circle
                            cx={star.x}
                            cy={star.y}
                            r={isExtraBright ? star.size * 2.5 : star.size * 2}
                            fill="url(#star-glow)"
                            animate={{
                              opacity: isExtraBright ? [0.4, 0.6, 0.4] : [0.3, 0.5, 0.3],
                              scale: [0.8, 1, 0.8]
                            }}
                            transition={{
                              duration: 2 + (i % 3),
                              repeat: Infinity,
                              delay: delay
                            }}
                          />
                        )}
                        <motion.circle
                          cx={star.x}
                          cy={star.y}
                          r={isExtraBright ? star.size * 1.2 : star.size}
                          fill="#FFFFFF"
                          animate={{
                            opacity: [
                              star.brightness,
                              isExtraBright ? star.brightness + 0.5 : star.brightness + 0.3,
                              star.brightness
                            ]
                          }}
                          transition={{
                            duration: isExtraBright ? 3 + (i % 2) : 1.5 + (i % 3),
                            repeat: Infinity,
                            delay: delay
                          }}
                        />
                      </motion.g>
                    );
                  })}
                </motion.g>
              )}
            </AnimatePresence>

            <g transform="translate(300,100)">
              {/* Reservoir */}
              <g>
                {/*buoy*/}
                <g transform="translate(-50,80)">
                  <motion.g
                    initial={{ y: 220 * (1 - waterLevel / 100) }}
                    animate={{ 
                      y: 220 * (1 - waterLevel / 100),
                      rotate: [-2, 2, -2]
                    }}
                    transition={{ 
                      y: { 
                        type: "spring", 
                        stiffness: 50, 
                        damping: 12 
                      },
                      rotate: {
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    {/* Storage percentage */}
                    <g transform="translate(-65,-17)">
                      <foreignObject x="-150" y="-10" width="200" height="24">
                        <div className="text-right" style={{ width: '100%', height: '100%' }}>
                          <AnimatedNumber
                            value={waterLevel}
                            decimals={1}
                            suffix="%"
                            className="text-2xl font-medium"
                          />
                        </div>
                      </foreignObject>
                    </g>

                    {/* Reflection buoy */}
                    <motion.g
                      transform={`translate(0,35)`}
                      animate={{
                        scale: [1, 0.98, 1],
                        opacity: [0.08, 0.06, 0.08],
                        rotate: [-1, 1, -1]
                      }}
                      transition={{
                        scale: {
                          repeat: Infinity,
                          duration: 2,
                          ease: "easeInOut"
                        },
                        opacity: {
                          repeat: Infinity,
                          duration: 2,
                          ease: "easeInOut"
                        },
                        rotate: {
                          repeat: Infinity,
                          duration: 3,
                          ease: "easeInOut"
                        }
                      }}
                    >
                      <image
                        href="/buoy.webp"
                        x="-20"
                        y="-2"
                        width="40"
                        height="40"
                        opacity="0.08"
                        transform="scale(1, -0.85) translate(0, -15)"
                        style={{ filter: 'blur(2.5px)' }}
                      />
                    </motion.g>

                    {/* Main buoy */}
                    <image
                      href="/buoy.webp"
                      x="-20"
                      y="-32"
                      width="40"
                      height="40"
                    />

                    {/* Buoy navigation light */}
                    <motion.g
                      animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [0.8, 1.3, 0.8]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <circle
                        cx="0"
                        cy="-28"
                        r="6"
                        fill="url(#buoy-light-glow)"
                      />
                      <circle
                        cx="0"
                        cy="-28"
                        r="2s"
                        fill="#FF0000"
                      />
                    </motion.g>

                    {/* Water level measurement */}
                    <g transform="translate(22,-17)">
                      <foreignObject x="-30" y="-10" width="150" height="24">
                        <div className="text-center" style={{ width: '100%', height: '100%' }}>
                          <AnimatedNumber
                            value={parseFloat(currentData?.waterLevel || '0')}
                            decimals={2}
                            suffix="m"
                            className="text-2xl font-medium"
                          />
                        </div>
                      </foreignObject>
                    </g>
                  </motion.g>
                </g>

                {/* Water area on top */}
                <motion.rect
                  x="-300"
                  initial={{ y: 80 + (220 * (1 - waterLevel / 100)), height: 220 * (waterLevel / 100) }}
                  animate={{ y: 80 + (220 * (1 - waterLevel / 100)), height: 220 * (waterLevel / 100) }}
                  transition={{ type: "spring", stiffness: 50, damping: 15 }}
                  width="420"
                  fill="url(#water-gradient)"
                  rx="0 12 12 0"
                />
                <g transform="translate(120,80)">
                  {/* Penstock pipe connecting spillway to dam */}
                  <path d="M90 200,
                                           60 180"
                    stroke="hsl(var(--dam-structure-dark))"
                    strokeWidth="8"
                    fill="none"
                    opacity="0.9" />


                </g>
                {/* Spilway struct behind dam */}
                <g transform="translate(210,260)">

                  <path d="M6 10
                                              L-13 40
                                              L80 40
                                              60 10
                                              Z"
                    fill="hsl(var(--dam-structure))"
                    opacity="0.5" />

                </g>

                {/* Dam Structure */}
                <g transform="translate(120,80)">
                  {/* Main dam wall */}
                  <path d="M-2 0 
                           L-8 220 
                           L90 220 
                           L15 0 
                           Z"
                    fill="hsl(var(--dam-structure))" />

                  {/*  Spillway opening/anim */}
                  <g transform="translate(90,180)">

                    {/* Circular openings - closer together */}
                    {[25, 45].map((x, i) => (
                      <g key={`spillway-opening-${i}`}>
                        <circle
                          cx={x}
                          cy="25"
                          r="5"
                          fill="hsl(var(--dam-structure-dark))"
                          opacity="0.9"
                        />
                        <circle
                          cx={x}
                          cy="25"
                          r="4"
                          fill="gray"
                          stroke="hsl(var(--dam-structure-dark))"
                          strokeWidth="2"
                          opacity="0.9"
                        />
                      </g>
                    ))}

                    {/* Spillway water flow */}
                    {currentData?.spillwayRelease > 0 && (
                      <g>
                        {/* Round outlet flows */}
                        {[25, 45].map((x, i) => (
                          <motion.path
                            key={`spillway-flow-${i}`}
                            d={`M${x} 24
                                L${x} 40`}
                            stroke="hsl(var(--dam-water))"
                            strokeWidth="6"
                            fill="none"
                            opacity="0.6"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{
                              duration: 0.8,
                              repeat: 0,
                              ease: "linear"
                            }}
                          />
                        ))}
                      </g>
                    )}
                  </g>

                  {/* bottom bar */}
                  <rect x="-15" y="210"
                    width="110" height="15"
                    fill="hsl(var(--dam-structure))" />
                  <g>




                    {/* Power house penstock*/}
                    <path d="M-7 200 
                             L30 205
                             L50 208"
                      stroke="hsl(var(--dam-structure-dark))"
                      strokeWidth="8"
                      fill="none"
                      opacity="0.9" />

                    {/* Power house water flow anim */}
                    {currentData?.powerHouseDischarge > 0 && (
                      <motion.path
                        d="M-7 200 
                             L30 205
                             L50 208"
                        stroke="hsl(var(--dam-water))"
                        strokeWidth="4"
                        fill="none"
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{ opacity: 0.6, pathLength: 1 }}
                        transition={{
                          opacity: { duration: 0.2 },
                          pathLength: { duration: 1, repeat: 0 }
                        }}
                      />
                    )}

                    {/* Power house structure */}
                    <g transform="translate(45,200)">


                      {/* Power house building */}
                      <path d="M 0 0 
                               L 25 0 
                               L 25 20 
                               L 0 20 Z"
                        fill="hsl(var(--dam-building))"
                        opacity="0.95" />

                      {/* top of building */}
                      <path d="M 0 0 
                             L 25 0 
                             L 25 2 
                             L 0 2 Z"
                        fill="hsl(var(--dam-structure-dark))"
                        opacity="0.9" />

                      {/*  windows */}
                      <rect x="2" y="5"
                        width="6" height="12"
                        fill="hsl(var(--dam-window))"
                        opacity="var(--dam-window-opacity)" />
                      <rect x="10" y="5"
                        width="6" height="12"
                        fill="hsl(var(--dam-window))"
                        opacity="var(--dam-window-opacity)" />
                      <rect x="18" y="5"
                        width="4" height="12"
                        fill="hsl(var(--dam-window))"
                        opacity="var(--dam-window-opacity)" />

                      {/* Turbine  */}
                      <g transform="translate(12.5,11) scale(0.9)">
                        {currentData?.powerHouseDischarge > 0 ? (
                          <>
                            {/* Rotating */}
                            <g>
                              <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from="0"
                                to="360"
                                dur={`${Math.max(0.1, 2 - (currentData.powerHouseDischarge / 50))}s`}
                                repeatCount="indefinite" />

                              {/*  turbine blades */}
                              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                                <path
                                  key={`turbine-blade-${i}`}
                                  d={`M 0 0 
                                         L ${6 * Math.cos((angle - 20) * Math.PI / 180)} ${6 * Math.sin((angle - 20) * Math.PI / 180)}
                                         A 8 8 0 0 1 ${6 * Math.cos((angle + 20) * Math.PI / 180)} ${6 * Math.sin((angle + 20) * Math.PI / 180)}
                                         Z`}
                                  fill="hsl(var(--dam-structure-dark))"
                                  opacity="0.9"
                                  transform={`rotate(${angle})`}
                                />
                              ))}
                            </g>



                            {/* Inner hub */}
                            <circle r="3.5"
                              fill="hsl(var(--dam-structure-dark))"
                              opacity="0.9" />

                            {/* Center dot */}
                            <circle r="1"
                              fill="hsl(var(--dam-structure-light))"
                              opacity="0.9" />
                          </>
                        ) : (
                          <>
                            {/* Static turbine blades */}
                            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                              <path
                                key={`turbine-blade-${i}`}
                                d={`M 0 0 
                                       L ${6 * Math.cos((angle - 20) * Math.PI / 180)} ${6 * Math.sin((angle - 20) * Math.PI / 180)}
                                       A 8 8 0 0 1 ${6 * Math.cos((angle + 20) * Math.PI / 180)} ${6 * Math.sin((angle + 20) * Math.PI / 180)}
                                       Z`}
                                fill="hsl(var(--dam-structure-dark))"
                                opacity="0.7"
                                transform={`rotate(${angle})`}
                              />
                            ))}



                            {/* Static inner hub */}
                            <circle r="3.5"
                              fill="hsl(var(--dam-structure-dark))"
                              opacity="0.7" />

                            {/* Static center dot */}
                            <circle r="1"
                              fill="hsl(var(--dam-structure-light))"
                              opacity="0.7" />
                          </>
                        )}
                      </g>
                    </g>
                  </g>

                  {/* Dam Top box */}
                  <path d="M -2 -5 L 20 -5 L 18 5 L -2 5 Z" fill="hsl(var(--dam-structure))" />

                  {/* Street light */}
                  <g transform="translate(12,-5)">
                    {/* Light pole */}
                    <rect 
                      x="-1" 
                      y="-15" 
                      width="2" 
                      height="15" 
                      fill="hsl(var(--dam-structure-dark))"
                      opacity="0.9"
                    />
                    {/* Light fixture */}
                    <path 
                      d="M-3 -15 L3 -15 L2 -12 L-2 -12 Z" 
                      fill={theme === 'dark' ? 'yellow' : 'hsl(var(--dam-structure-dark))'}
                      opacity="0.9"
                      stroke="gray"
                      strokeWidth="0.5"
                    />
                    
                  </g>

                  {/* line below house */}
                  <rect x="-4" y="5"
                    width="23" height="4"
                    fill="hsl(var(--dam-structure-dark))"
                    opacity="0.9" />

                  {/* mullaperiyar inspired 😁 maintainence building */}
                  <path d="M -10 -8 L -2 -8 L -2 3 L -10 0 Z" fill="hsl(var(--dam-building))" opacity="0.95" />
                  <path d="M-11 -8 L-6 -13 L-1 -8"
                    fill="hsl(var(--dam-structure-dark))"
                    stroke="hsl(var(--dam-structure-dark))"
                    strokeWidth="1"
                    opacity="0.9" />

                  {/* Building window */}
                  <rect x="-8" y="-6"
                    width="4" height="3"
                    fill="hsl(var(--dam-window))"
                    opacity="var(--dam-window-opacity)" />


                </g>
              </g>

              {/* Right side cards */}
              <g transform="translate(280,0)">
                <g transform="translate(0,130)">

                  <text x="5" y="30"
                    fill="hsl(var(--foreground))"
                    fontSize="14"
                    fontWeight="500">
                    Spillway Discharge
                  </text>
                  <foreignObject x="5" y="35" width="130" height="30">
                    <div className="text-2xl font-medium">
                      <AnimatedNumber
                        value={parseFloat(currentData?.spillwayRelease || '0')}
                        decimals={0}
                        suffix=" m³/s"
                      />
                    </div>
                  </foreignObject>
                </g>

                <g transform="translate(0,220)">

                  <text x="5" y="30"
                    fill="hsl(var(--foreground))"
                    fontSize="14"
                    fontWeight="500">
                    Power H. Discharge
                  </text>
                  <foreignObject x="5" y="35" width="130" height="30">
                    <div className="text-2xl font-medium">
                      <AnimatedNumber
                        value={parseFloat(currentData?.powerHouseDischarge || '0')}
                        decimals={0}
                        suffix=" m³/s"
                      />
                    </div>
                  </foreignObject>
                  
                </g>
              </g>

              {/* Input */}
              <g transform="translate(-290,0)">
                <g transform="translate(0,-30)">


                  <text x="0" y="-45"
                    fill="hsl(var(--foreground))"
                    fontSize="14"
                    fontWeight="500">
                    Rainfall
                  </text>
                  <foreignObject x="0" y="-45" width="130" height="30">
                    <div className="text-2xl font-medium">
                      <AnimatedNumber
                        value={parseFloat(currentData?.rainfall || '0')}
                        decimals={0}
                        suffix=" mm"
                      />
                    </div>
                  </foreignObject>
                </g>

                <g transform="translate(0,220)">

                  <text x="20" y="30"
                    fill="hsl(var(--foreground))"
                    fontSize="14"
                    fontWeight="500">
                    Inflow
                  </text>
                  <foreignObject x="20" y="35" width="130" height="30">
                    <div className="text-2xl font-medium">
                      <AnimatedNumber
                        value={parseFloat(currentData?.inflow || '0')}
                        decimals={0}
                        suffix=" m³/s"
                      />
                    </div>
                  </foreignObject>
                 
                </g>
              </g>
            </g>
          </svg>
          {hasRainfall && (
            <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
              {raindrops.map((drop) => (
                <div
                  key={`raindrop-${drop.key}`}
                  className="drop"
                  style={{
                    left: drop.left,
                    height: drop.height,
                    animationDelay: drop.animationDelay,
                    background: theme === 'light' ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.2)'
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="px-6 pt-4 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-8 w-8 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="text-sm text-muted-foreground font-medium min-w-[150px] justify-start"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {currentData?.date && formatDate(currentData.date)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <CalendarComponent
                mode="single"
                selected={currentDate}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  return !availableDates.some(
                    (d) => d.toDateString() === date.toDateString()
                  );
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === data.length - 1}
            className="h-8 w-8 shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-6 pb-8 pt-5 overflow-hidden">
          <div className="relative mx-4">
            <Slider
              value={[currentIndex]}
              min={0}
              max={data.length - 1}
              step={1}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            {data.length > 0 && (
            <div className="relative -mt-">
              <div className="relative text-[10px] text-muted-foreground">
                {/* reduce points */}
                {Array.from({ length: Math.min(6, Math.floor(data.length / 30)) }).map((_, idx, arr) => {
                  const dataIndex = Math.floor((idx * (data.length - 1)) / (arr.length - 1));
                  const position = `${(idx / (arr.length - 1)) * 100}%`;

                  return (
                    <div
                      key={dataIndex}
                      className="absolute"
                      style={{
                        left: position,
                        width: '28px',
                        transform: idx === 0 ? 'translateX(0)' :
                          idx === arr.length - 1 ? 'translateX(-100%)' :
                            'translateX(-50%)'
                      }}
                    >
                      <div className="h-2 w-[2px] bg-muted-foreground/40 mx-auto mb-1.5"></div>
                      <div className={`opacity-90 font-medium leading-none tracking-tight whitespace-nowrap ${idx === 0 ? 'text-left pl-0.5' :
                          idx === arr.length - 1 ? 'text-right pr-0.5' :
                            'text-center'
                        }`}>
                        {format(new Date(data[dataIndex].date.split('.').reverse().join('-')), 'MM/yy')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}