import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  presetDays: number;
  onPresetChange: (days: number) => void;
}

const DateRangeFilter = ({
  dateRange,
  onDateRangeChange,
  presetDays,
  onPresetChange,
}: DateRangeFilterProps) => {
  const presets = [
    { label: "7 días", days: 7 },
    { label: "30 días", days: 30 },
    { label: "90 días", days: 90 },
  ];

  const handlePresetClick = (days: number) => {
    onPresetChange(days);
    // Clear custom range when preset is selected
    onDateRangeChange(undefined);
  };

  const isCustomRange = dateRange?.from !== undefined;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Período:</span>
      
      {/* Preset buttons */}
      {presets.map((preset) => (
        <Button
          key={preset.days}
          variant={!isCustomRange && presetDays === preset.days ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick(preset.days)}
        >
          {preset.label}
        </Button>
      ))}

      {/* Custom date range picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isCustomRange ? "default" : "outline"}
            size="sm"
            className={cn(
              "justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd MMM", { locale: es })} -{" "}
                  {format(dateRange.to, "dd MMM yyyy", { locale: es })}
                </>
              ) : (
                format(dateRange.from, "dd MMM yyyy", { locale: es })
              )
            ) : (
              <span>Rango personalizado</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {/* Clear custom range button */}
      {isCustomRange && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onDateRangeChange(undefined);
            onPresetChange(30);
          }}
        >
          Limpiar
        </Button>
      )}
    </div>
  );
};

export default DateRangeFilter;
