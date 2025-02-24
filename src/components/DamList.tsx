import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { Dam } from "@/types/dam";
import { AnimatedNumber } from '@/components/ui/animated-number';

type SortField = "storagePercentage" | "liveStorage" | "totalCapacity" | "inflow" | 
                 "powerhouseDischarge" | "spillwayRelease" | "totalOutflow" | 
                 "rainfall" | "name";
type SortDirection = "asc" | "desc";

interface DamListProps {
  dams: Dam[];
  isLoading: boolean;
  error: Error | null;
}

const getSortLabel = (field: SortField): string => {
  const labels: Record<SortField, string> = {
    storagePercentage: "Storage Percnt.",
    liveStorage: "Current Storage",
    totalCapacity: "Total Capacity",
    inflow: "Inflow",
    powerhouseDischarge: "Powerhouse Discharge",
    spillwayRelease: "Spillway Release",
    totalOutflow: "Total Outflow",
    rainfall: "Rainfall",
    name: "Name"
  };
  return labels[field];
};

const formatUnits: Record<string, string> = {
  waterLevel: "m",
  liveStorage: "MCM",
  totalCapacity: "MCM",
  inflow: "cumecs",
  powerhouseDischarge: "cumecs",
  spillwayRelease: "cumecs",
  totalOutflow: "cumecs",
  rainfall: "mm",
  storagePercentage: "%",
};

const formatValue = (value: string | undefined, property: string) => {
  const numValue = parseFloat(value || "");
  return typeof numValue === "number" && !isNaN(numValue)
    ? `${numValue.toFixed(2)}${formatUnits[property] || ""}`
    : property === "name"
    ? value
    : "N/A";
};

const formatLastUpdate = (lastUpdate: string | undefined) => {
  if (!lastUpdate) return null;
  
  const parts = lastUpdate.split('.');
  if (parts.length === 3) {
    return lastUpdate;
  }
  return lastUpdate;
};

const DamList = ({ dams, isLoading, error }: DamListProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("storagePercentage");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  const handleDamClick = useCallback(
    (dam: Dam) => {
      navigate(`/${dam.name}`);
    },
    [navigate]
  );

  const getDamAlertStatus = (dam: Dam) => {
    const redLevel = parseFloat(dam.redLevel);
    const orangeLevel = parseFloat(dam.orangeLevel);
    const blueLevel = parseFloat(dam.blueLevel);
    const waterLevel = parseFloat(dam.data[0]?.waterLevel || "0");

    if (waterLevel >= redLevel) return "red";
    if (waterLevel >= orangeLevel) return "orange";
    if (waterLevel >= blueLevel) return "blue";
    return "normal";
  };

  const getAlertStyles = (alertStatus: string) => {
    switch (alertStatus) {
      case "red":
        return "border-l-4 border-red-500 relative bg-red-500/5 hover:bg-red-500/10 hover:border-red-600 transition-colors duration-300";
      case "orange":
        return "border-l-4 border-orange-500 relative bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-600 transition-colors duration-300";
      case "blue":
        return "border-l-4 border-blue-500 relative bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-600 transition-colors duration-300";
      default:
        return "border-l-4 border-zinc-600 relative bg-zinc-600/5 hover:bg-zinc-600/10 hover:border-zinc-700 transition-colors duration-300";
    }
  };

  const getAlertLabel = (alertStatus: string) => {
    switch (alertStatus) {
      case "red":
        return { text: "RED", bgClass: "bg-gradient-to-r from-red-500 to-red-600 w-[90px] text-xs tracking-widest shadow-sm shadow-red-500/20" };
      case "orange":
        return { text: "ORANGE", bgClass: "bg-gradient-to-r from-orange-500 to-orange-600 w-[90px] text-xs tracking-widest shadow-sm shadow-orange-500/20" };
      case "blue":
        return { text: "BLUE", bgClass: "bg-gradient-to-r from-blue-500 to-blue-600 w-[90px] text-xs tracking-widest shadow-sm shadow-blue-500/20" };
      default:
        return { text: "NO ALERT", bgClass: "bg-gradient-to-r from-zinc-600 to-zinc-700 w-[90px] text-xs tracking-widest shadow-sm shadow-zinc-600/20" };
    }
  };

  const filteredAndSortedDams = useMemo(() => {
    let result = dams.filter((dam) =>
      dam.name.toLowerCase().includes(search.toLowerCase())
    );

    result = result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "storagePercentage":
          comparison = (parseFloat(a.data[0]?.storagePercentage || "0") - parseFloat(b.data[0]?.storagePercentage || "0"));
          break;
        case "liveStorage":
          comparison = (parseFloat(a.data[0]?.liveStorage || "0") - parseFloat(b.data[0]?.liveStorage || "0"));
          break;
        case "totalCapacity":
          comparison = (parseFloat(a.liveStorageAtFRL || "0") - parseFloat(b.liveStorageAtFRL || "0"));
          break;
        case "inflow":
          comparison = (parseFloat(a.data[0]?.inflow || "0") - parseFloat(b.data[0]?.inflow || "0"));
          break;
        case "powerhouseDischarge":
          comparison = (parseFloat(a.data[0]?.powerHouseDischarge || "0") - parseFloat(b.data[0]?.powerHouseDischarge || "0"));
          break;
        case "spillwayRelease":
          comparison = (parseFloat(a.data[0]?.spillwayRelease || "0") - parseFloat(b.data[0]?.spillwayRelease || "0"));
          break;
        case "totalOutflow":
          comparison = (parseFloat(a.data[0]?.totalOutflow || "0") - parseFloat(b.data[0]?.totalOutflow || "0"));
          break;
        case "rainfall":
          comparison = (parseFloat(a.data[0]?.rainfall || "0") - parseFloat(b.data[0]?.rainfall || "0"));
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [dams, search, sortField, sortDirection]);

  const getSortedValue = (dam: Dam) => {
    switch (sortField) {
      case "storagePercentage":
        return formatValue(dam.data[0]?.storagePercentage, sortField);
      case "liveStorage":
        return formatValue(dam.data[0]?.liveStorage, sortField);
      case "totalCapacity":
        return formatValue(dam.liveStorageAtFRL, "totalCapacity");
      case "inflow":
        return formatValue(dam.data[0]?.inflow, sortField);
      case "powerhouseDischarge":
        return formatValue(dam.data[0]?.powerHouseDischarge, "powerhouseDischarge");
      case "spillwayRelease":
        return formatValue(dam.data[0]?.spillwayRelease, sortField);
      case "totalOutflow":
        return formatValue(dam.data[0]?.totalOutflow, sortField);
      case "rainfall":
        return formatValue(dam.data[0]?.rainfall, sortField);
      default:
        return dam.name;
    }
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="glass-card m-4">
          <CardContent className="p-4">
            <p className="text-red-500">Error loading dam data: {error.message}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="mx-2 sm:mx-4 h-full flex flex-col overflow-hidden bg-background border-none shadow-xl">
        <CardHeader className="p-2 sm:p-4 border-b bg-muted">
          <div className="flex items-center w-full">
            <CardTitle className="text-md sm:text-sm lg:text-lg font-bold flex-1 min-w-0 truncate pr-3">
              Kerala Dam Water Level
            </CardTitle>
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-9 w-9 sm:h-10 sm:w-10 backdrop-blur-sm bg-background/50 border border-border/50 rounded-lg overflow-hidden flex items-center justify-center">
                <ThemeToggle />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 min-w-0 max-w-full mt-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full max-w-full h-10 bg-background/90 border-border/50 focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex items-stretch gap-3 min-w-0">
              <div className="flex-1 min-w-0">
                <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
                  <SelectTrigger className="w-full max-w-full h-10 bg-background/90 border-border/50">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    {([
                      "name",
                      "storagePercentage",
                      "liveStorage",
                      "totalCapacity",
                      "inflow",
                      "powerhouseDischarge",
                      "spillwayRelease",
                      "totalOutflow",
                      "rainfall"
                    ] as SortField[]).map((field) => (
                      <SelectItem key={field} value={field}>
                        {getSortLabel(field)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleSortDirection}
                    className="h-10 w-10 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent/50"
                  >
                    <ArrowUpDown className={`h-4 w-4 transform transition-all duration-200 ease-out ${
                      sortDirection === "desc" ? "rotate-180" : "rotate-0"
                    }`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle sort direction</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-24 rounded-lg bg-gray-200 dark:bg-gray-700"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: i * 0.1 }
                      }}
                    />
                  ))}
                </motion.div>
              ) : (
                filteredAndSortedDams.map((dam, index) => {
                  const alertStatus = getDamAlertStatus(dam);
                  return (
                    <motion.div
                      key={dam.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: index * 0.05 }
                      }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                      className="min-w-0"
                    >
                      <Card
                        className={`cursor-pointer ${getAlertStyles(alertStatus)} overflow-hidden hover:shadow-lg bg-card group transition-all duration-300 ease-in-out`}
                        onClick={() => handleDamClick(dam)}
                      >
                        <div className="absolute left-0 top-0 flex items-center">
                          <div className={`${getAlertLabel(alertStatus).bgClass} text-white h-7 flex items-center justify-center text-xs font-medium text-center tracking-wide rounded-br-lg shadow-sm group-hover:shadow-md transition-all duration-300`}>
                            {getAlertLabel(alertStatus).text}
                          </div>
                        </div>
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex justify-between items-start gap-4 min-w-0 mt-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm sm:text-base truncate pr-2  transition-colors duration-300">{dam.name}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground/80 truncate mt-0.5">
                                {formatValue(dam.data[0]?.waterLevel, "waterLevel")}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-semibold text-sm sm:text-base whitespace-nowrap">
                                {sortField === "name" ? (
                                  <AnimatedNumber 
                                    value={dam.data[0]?.waterLevel ? parseFloat(dam.data[0].waterLevel) : 0}
                                    decimals={2}
                                    suffix="m"
                                  />
                                ) : (
                                  <AnimatedNumber 
                                    value={parseFloat(getSortedValue(dam) || '0')}
                                    decimals={
                                      ["waterLevel", "storagePercentage"].includes(sortField) ? 2 : 1
                                    }
                                    suffix={
                                      sortField === "storagePercentage" ? "%" :
                                      (sortField === "liveStorage" || sortField === "totalCapacity") ? " MCM" :
                                      ["totalOutflow", "inflow", "powerhouseDischarge", "spillwayRelease"].includes(sortField) ? " cumecs" :
                                      sortField === "rainfall" ? " mm" :
                                      " m"
                                    }
                                  />
                                )}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground/80 whitespace-nowrap mt-0.5">
                                {getSortLabel(sortField)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </CardContent>
        </ScrollArea>
      </Card>
    </motion.div>
  );
};

export default DamList;
