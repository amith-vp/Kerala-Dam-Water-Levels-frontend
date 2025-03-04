import { Button } from "@/components/ui/button";
import { TimeRangePicker } from "@/components/ui/time-range-picker";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";

interface DamHeaderProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  isTimeRangeLoading: boolean;
  currentDate?: string;
  referenceDate: Date;
}

export function DamHeader({ 
  dateRange, 
  onDateRangeChange, 
  isTimeRangeLoading, 
  currentDate,
  referenceDate 
}: DamHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="flex flex-row items-center gap-2 p-4 bg-background/50 backdrop-blur-sm border-b"
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          size="icon"
          className="h-8 w-8 flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {currentDate && (
          <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
            {currentDate}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <TimeRangePicker 
          value={dateRange}
          onChange={onDateRangeChange}
          className="w-[120px] sm:w-[140px] flex-shrink-0"
          referenceDate={referenceDate}
          isLoading={isTimeRangeLoading}
        />
        <div className="h-8 w-8 backdrop-blur-sm bg-background/50 border border-border/50 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </motion.div>
  );
}