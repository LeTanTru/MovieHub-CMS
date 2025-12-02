type ListProps = React.HTMLAttributes<HTMLUListElement>;

export default function List({ children, ...props }: ListProps) {
  return <ul {...props}>{children}</ul>;
}
