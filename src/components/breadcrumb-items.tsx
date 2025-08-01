import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

export default function BreadcrumbItems({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <BreadcrumbItem key={index}>
              {isLast ? (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                </>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={item.href || "#"}>{item.label}</Link>
                  </BreadcrumbLink>
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
