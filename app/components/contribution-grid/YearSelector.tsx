import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface YearSelectorProps {
  availableYears: number[];
  selectedYear: number | null;
  onYearSelect: (year: number | null) => void;
}

export function YearSelector({ availableYears, selectedYear, onYearSelect }: YearSelectorProps) {
  return (
    <div className="flex flex-col gap-2 w-auto max-w-xs mx-auto md:min-w-[60px] md:mx-0">
      {availableYears.map((year) => (
        <Button
          key={year}
          variant={selectedYear === year ? "default" : "ghost"}
          className={cn(
            "justify-start text-sm font-semibold",
            selectedYear === year && "bg-primary text-primary-foreground"
          )}
          onClick={() => onYearSelect(year)}
        >
          {year}
        </Button>
      ))}
    </div>
  );
}