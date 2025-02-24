import * as React from "react"
import { addDays, addMonths, startOfDay, format, isWithinInterval } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface TimeRangePickerProps {
  className?: string
  value: DateRange | undefined
  onChange: (date: DateRange | undefined) => void
  referenceDate?: Date
  isLoading?: boolean
}

const timeRanges = [
  { label: "1 Week", value: "1w", getDates: (ref: Date) => ({ from: addDays(startOfDay(ref), -7), to: ref }) },
  { label: "1 Month", value: "1m", getDates: (ref: Date) => ({ from: addMonths(startOfDay(ref), -1), to: ref }) },
  { label: "3 Months", value: "3m", getDates: (ref: Date) => ({ from: addMonths(startOfDay(ref), -3), to: ref }) },
  { label: "6 Months", value: "6m", getDates: (ref: Date) => ({ from: addMonths(startOfDay(ref), -6), to: ref }) },
  { label: "1 Year", value: "1y", getDates: (ref: Date) => ({ from: addMonths(startOfDay(ref), -12), to: ref }) },
  { label: "2 Years", value: "2y", getDates: (ref: Date) => ({ from: addMonths(startOfDay(ref), -24), to: ref }) },
  { label: "All Time", value: "all", getDates: (ref: Date) => ({ from: new Date(2020, 0, 1), to: ref }) },
]

export function TimeRangePicker({
  className,
  value,
  onChange,
  referenceDate = new Date(),
  isLoading = false
}: TimeRangePickerProps) {
  const handleChange = (selectedValue: string) => {
    const range = timeRanges.find(r => r.value === selectedValue);
    if (range) {
      const dates = range.getDates(referenceDate);
      onChange(dates);
    }
  };

  const getCurrentValue = () => {
    if (!value?.from || !value?.to) return "1w";
    
    // Compare with each range's dates
    for (const range of timeRanges) {
      const rangeDates = range.getDates(value.to);
      if (
        Math.abs(startOfDay(rangeDates.from).getTime() - startOfDay(value.from).getTime()) < 1000 * 60 * 60 &&
        Math.abs(startOfDay(rangeDates.to).getTime() - startOfDay(value.to).getTime()) < 1000 * 60 * 60
      ) {
        return range.value;
      }
    }
    return "1w";
  };

  const formatDateRange = (dates: DateRange | undefined) => {
    if (!dates) return '';
    return `${format(dates.from, 'dd/MM')} - ${format(dates.to, 'dd/MM')}`;
  };

  return (
    <Select onValueChange={handleChange} value={getCurrentValue()} disabled={isLoading}>
      <SelectTrigger className={cn(
        "w-[140px] transition-all duration-200",
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SelectValue placeholder="Time Range" />
        )}
      </SelectTrigger>
      <SelectContent>
        {timeRanges.map((range) => (
          <SelectItem 
            key={range.value} 
            value={range.value} 
            className="!p-2 [&_svg]:hidden"
          >
            {range.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}