import type { HTMLAttributes } from 'react';

type ListProps = HTMLAttributes<HTMLUListElement>;

export function List({ children, ...props }: ListProps) {
  return <ul {...props}>{children}</ul>;
}
