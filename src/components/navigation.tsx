import { PageTab, PageTabs } from "@saleor/macaw-ui";
import { useRouter } from "next/router";

export const Navigation = () => {
  const router = useRouter();

  return (
    <PageTabs
      onChange={(route) => {
        router.push(route);
      }}
      value={router.pathname}
    >
      <PageTab value="/preview" label="Preview" />
      <PageTab value="/settings" label="Settings" />
    </PageTabs>
  );
};
