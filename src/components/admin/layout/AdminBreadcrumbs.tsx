import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const AdminBreadcrumbs = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const section = params.get("section");

  const getSectionTitle = () => {
    if (!section) return "Dashboard";
    
    const parts = section.split("-");
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  };

  const getCategory = () => {
    if (!section) return null;
    return section.split("-")[0].charAt(0).toUpperCase() + section.split("-")[0].slice(1);
  };

  const category = getCategory();
  const title = getSectionTitle();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
        </BreadcrumbItem>
        {category && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
