import type { HTMLAttributes } from 'react';

type ListProps = HTMLAttributes<HTMLUListElement>;

export const List = ({ children, ...props }: ListProps) => {
  return <ul {...props}>{children}</ul>;
};
