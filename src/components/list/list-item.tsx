type ListItemProps = React.HTMLAttributes<HTMLLIElement>;

export default function ListItem({ children, ...props }: ListItemProps) {
  return <li {...props}>{children}</li>;
}
