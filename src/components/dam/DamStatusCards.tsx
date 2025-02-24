import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Droplet, Gauge, CloudRain, ArrowDown, ArrowUp, Zap, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

interface DamStatusCardsProps {
  currentData: any;
  damData: any;
  waterLevelStats: {
    min: number;
    max: number;
    avg: number;
  } | null;
}

function getAlertZone(waterLevel: number, damData: any) {
  if (waterLevel >= parseFloat(damData.redLevel)) return 'red';
  if (waterLevel >= parseFloat(damData.orangeLevel)) return 'orange';
  if (waterLevel >= parseFloat(damData.blueLevel)) return 'blue';
  return 'normal';
}

export function DamStatusCards({ currentData, damData, waterLevelStats }: DamStatusCardsProps) {
  const currentAlertZone = currentData ? getAlertZone(parseFloat(currentData.waterLevel), damData) : 'normal';

  return (
    <motion.div 
      className="grid grid-cols-1 gap-4 md:grid-cols-4"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
          }
        }
      }}
    >
      {/* Water Level Card */}
      <motion.div variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}>
        <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-sm border-l-4 border-l-blue-500 transition-all duration-300 hover:shadow-lg h-[160px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base font-medium text-muted-foreground flex items-center gap-2">
              <Droplet className="h-4 w-4 text-blue-500" />
              Water Level
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl md:text-2xl font-bold tracking-tight">
                  <AnimatedNumber 
                    value={currentData?.waterLevel ? parseFloat(currentData.waterLevel) : 0} 
                    decimals={2}
                    suffix=" m"
                  />
                </span>
                {currentData && (
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-xs md:text-sm font-medium transition-colors",
                    currentAlertZone === 'red' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                    currentAlertZone === 'orange' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                    currentAlertZone === 'blue' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    "shadow-sm"
                  )}>
                    {currentAlertZone === 'red' ? 'Red Alert' :
                    currentAlertZone === 'orange' ? 'Orange Alert' :
                    currentAlertZone === 'blue' ? 'Blue Alert' : 'No Alert'}
                  </div>
                )}
              </div>
              {waterLevelStats && (
                <div className="grid grid-cols-3 gap-1 mt-auto">
                  <div className="flex flex-col items-center p-1.5 rounded-md bg-background/50 dark:bg-black/30">
                    <span className="text-xs md:text-sm text-muted-foreground">Min</span>
                    <span className="text-xs md:text-sm font-medium">
                      <AnimatedNumber value={waterLevelStats.min} decimals={1} suffix=" m" />
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-1.5 rounded-md bg-background/50 dark:bg-black/30">
                    <span className="text-xs md:text-sm text-muted-foreground">Avg</span>
                    <span className="text-xs md:text-sm font-medium">
                      <AnimatedNumber value={waterLevelStats.avg} decimals={1} suffix=" m" />
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-1.5 rounded-md bg-background/50 dark:bg-black/30">
                    <span className="text-xs md:text-sm text-muted-foreground">Max</span>
                    <span className="text-xs md:text-sm font-medium">
                      <AnimatedNumber value={waterLevelStats.max} decimals={1} suffix=" m" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Storage Card */}
      <motion.div variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}>
        <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-sm border-l-4 border-l-emerald-500 transition-all duration-300 hover:shadow-lg h-[160px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base font-medium text-muted-foreground flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-500" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl md:text-2xl font-bold tracking-tight flex items-baseline">
                  <AnimatedNumber 
                    value={currentData?.storagePercentage ? parseFloat(currentData.storagePercentage) : 0}
                    decimals={1}
                    suffix="%"
                  />
                </span>
                <div className="text-xs md:text-sm text-muted-foreground">
                  <AnimatedNumber 
                    value={parseFloat(currentData?.liveStorage || "0")}
                    decimals={1}
                    suffix=" MCM"
                  />
                </div>
              </div>
              <Progress 
                value={(parseFloat(currentData?.liveStorage || "0") / parseFloat(damData.liveStorageAtFRL)) * 100} 
                className="h-2" 
              />
              <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground mt-2">
                <span>Total Capacity</span>
                <span className="font-medium">
                  <AnimatedNumber value={parseFloat(damData.liveStorageAtFRL)} decimals={1} suffix=" MCM" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 md:contents">
        {/* Inflow Card */}
        <motion.div variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0 }
        }}>
          <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-sm border-l-4 border-l-blue-500 transition-all duration-300 hover:shadow-lg h-[160px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base font-medium text-muted-foreground flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-blue-500" />
                Inflow
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl md:text-2xl font-bold tracking-tight">
                    <AnimatedNumber 
                      value={currentData?.inflow ? parseFloat(currentData.inflow) : 0}
                      decimals={1}
                      suffix=" m³/s"
                    />
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground mt-auto pt-2 border-t">
                  <div className="flex items-center gap-1.5">
                    <CloudRain className="h-3.5 w-3.5 text-sky-500" />
                    <span>Rainfall</span>
                  </div>
                  <span className="font-medium">
                    <AnimatedNumber value={currentData?.rainfall ? parseFloat(currentData.rainfall) : 0} decimals={1} suffix=" mm" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Outflow Card */}
        <motion.div variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0 }
        }}>
          <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-sm border-l-4 border-l-purple-500 transition-all duration-300 hover:shadow-lg h-[160px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base font-medium text-muted-foreground flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-purple-500" />
                Outflow
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl md:text-2xl font-bold tracking-tight">
                    <AnimatedNumber 
                      value={currentData?.totalOutflow ? parseFloat(currentData.totalOutflow) : 0}
                      decimals={1}
                      suffix=" m³/s"
                    />
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t text-xs md:text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Zap className="h-3.5 w-3.5 text-yellow-500" />
                      <span>Power</span>
                    </div>
                    <span className="font-medium">
                      <AnimatedNumber value={currentData?.powerHouseDischarge ? parseFloat(currentData.powerHouseDischarge) : 0} decimals={1} suffix=" m³/s" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Waves className="h-3.5 w-3.5 text-red-500" />
                      <span>Spillway</span>
                    </div>
                    <span className="font-medium">
                      <AnimatedNumber value={currentData?.spillwayRelease ? parseFloat(currentData.spillwayRelease) : 0} decimals={1} suffix=" m³/s" />
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}