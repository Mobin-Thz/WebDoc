import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type Crumb = Readonly<{ href?: string; label: string }>;
type BreadcrumbsProps = Readonly<{ items: Crumb[] }>;

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <Breadcrumb className="breadcrumbs">
      <BreadcrumbList>
        {items.flatMap((item, index) => [
          <BreadcrumbItem key={`${item.label}-${index}`}>
            {item.href ? <BreadcrumbLink render={<Link href={item.href} />}>{item.label}</BreadcrumbLink> : <BreadcrumbPage>{item.label}</BreadcrumbPage>}
          </BreadcrumbItem>,
          ...(index < items.length - 1 ? [<BreadcrumbSeparator key={`separator-${index}`} />] : []),
        ])}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
