interface Props {
  message: string;
}

export function EmptyState({ message }: Props) {
  return <div className="text-center text-sm text-gray-500 py-8">{message}</div>;
}
