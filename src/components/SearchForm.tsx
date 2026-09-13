import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFormProps = Readonly<{ compact?: boolean }>;

export function SearchForm({ compact = false }: SearchFormProps) {
  const inputID = compact ? "header-search" : "hero-search";
  return (
    <form className={cn("search-form", compact && "compact")} action="/search" role="search">
      <label className="sr-only" htmlFor={inputID}>Search lessons</label>
      <Input id={inputID} name="q" type="search" placeholder="Search lessons..." />
      {!compact && <Button type="submit">Search</Button>}
    </form>
  );
}
