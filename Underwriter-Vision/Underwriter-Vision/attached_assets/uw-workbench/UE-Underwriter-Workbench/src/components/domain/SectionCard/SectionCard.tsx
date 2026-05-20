import type { ReactNode } from 'react';
import { Card } from '@/components/common';

interface Props {
  title: string;
  filters?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, filters, footer, children }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">{title}</h3>
        {filters}
      </div>
      <div className="p-4">{children}</div>
      {footer && (
        <div className="border-t border-gray-200 px-4 py-2 text-right text-sm">{footer}</div>
      )}
    </Card>
  );
}
