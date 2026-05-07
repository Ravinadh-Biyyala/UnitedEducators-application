import { useRef } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { FileDropzone } from '@/components/common/FileDropzone';
import type { FileDropzoneHandle } from '@/components/common/FileDropzone';
import { SectionPanel } from '@/components/common/SectionPanel';
import type { UploadedDocument } from '@/shared/types';

interface SubmissionDocumentsSectionProps {
  value:    UploadedDocument[];
  onChange: (docs: UploadedDocument[]) => void;
}

export function SubmissionDocumentsSection({ value, onChange }: SubmissionDocumentsSectionProps) {
  const fileDropzoneRef                    = useRef<FileDropzoneHandle>(null);
  const successCount                       = value.filter((d) => d.status === 'success').length;

  return (
    <SectionPanel
      title="Submission Documents"
      badge={successCount > 0 ? successCount : undefined}
      action={
        <Button
          variant="primary"
          onClick={() => fileDropzoneRef.current?.openPicker()}
          style={{ fontSize: 11.2, fontWeight: 700, padding: '5px 12px' }}
        >
          <Plus size={11} style={{ marginRight: 6 }} />
          Add Document
        </Button>
      }
    >
      <FileDropzone
        ref={fileDropzoneRef}
        value={value}
        onChange={onChange}
        accept=".pdf,.docx,.xlsx,.png"
      />
    </SectionPanel>
  );
}
