export type BreadcrumbType = {
  label: string;
  href?: string;
};

export type ReusableBreadcrumbProps = {
  items: BreadcrumbType[];
  separator?: React.ReactNode;
};
