import type { HTMLAttributes } from 'react';

type ListItemProps = HTMLAttributes<HTMLLIElement>;

export default function ListItem({ children, ...props }: ListItemProps) {
  return <li {...props}>{children}</li>;
}
