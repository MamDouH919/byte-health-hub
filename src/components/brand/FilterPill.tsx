import { ChevronDown } from "lucide-react";

export const FilterPill = ({ label, count, onClick }: { label: string; count: number; onClick?: () => void }) => (
  <button type="button" onClick={onClick} className="filter-pill min-w-[220px]">
    <span className="text-foreground">{label}</span>
    <span className="text-muted-foreground">({count})</span>
    <ChevronDown className="h-4 w-4 text-muted-foreground" />
  </button>
);
