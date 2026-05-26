import type { CSSProperties, DragEvent as ReactDragEvent } from 'react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Eye, Paperclip, RotateCcw, Trash2 } from 'lucide-react';
import { useUploadDocumentMutation } from '@/services/submissions/submissionsApi';
import type { UploadedDocument } from '@/shared/types';
import { fileDropzoneStyles as s } from '@/theme';

export interface FileDropzoneHandle {
  openPicker: () => void;
}

interface FileDropzoneProps {
  value:    UploadedDocument[];
  onChange: (docs: UploadedDocument[]) => void;
  accept?:  string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FileIconType = 'pdf' | 'docx' | 'xlsx' | 'png' | 'unknown';

function getFileIconType(filename: string): FileIconType {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf')                                    return 'pdf';
  if (ext === 'docx' || ext === 'doc')                  return 'docx';
  if (ext === 'xlsx' || ext === 'xls')                  return 'xlsx';
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return 'png';
  return 'unknown';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1_024)      return `${bytes} B`;
  if (bytes < 1_048_576)  return `${Math.round(bytes / 1_024)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function formatTimestamp(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 60_000)     return 'Just now';
  if (diffMs < 3_600_000)  return `${Math.floor(diffMs / 60_000)}m ago`;
  return new Date(iso).toLocaleDateString();
}

// Shared style objects (internal to this file)
const metaText: CSSProperties = {
  fontFamily: '"Source Sans 3", sans-serif',
  fontWeight: s.metaFontWeight,
  fontSize:   s.metaFontSize,
  lineHeight: `${s.metaLineHeight}px`,
  color:      s.metaColor,
};

const separator: CSSProperties = {
  fontFamily:  '"Source Sans 3", sans-serif',
  fontWeight:  400,
  fontSize:    s.metaSeparatorFontSize,
  lineHeight:  `${s.metaSeparatorLineHeight}px`,
  color:       s.metaSeparatorColor,
};

const iconBtn: CSSProperties = {
  background:  'none',
  border:      'none',
  padding:     0,
  cursor:      'pointer',
  display:     'flex',
  alignItems:  'center',
  color:       s.metaColor,
};

// ─── FileIcon (internal) ──────────────────────────────────────────────────────

function FileIcon({ type }: { type: FileIconType }) {
  // Only PDF colors are Figma-confirmed. Other types reuse the same palette
  // since only PDF appears in the Figma mock — extend when other types are designed.
  const label = type === 'unknown' ? 'FILE' : type.toUpperCase();
  return (
    <div
      style={{
        width:           s.pdfIconBoxSize,
        height:          s.pdfIconBoxSize,
        flexShrink:      0,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: s.pdfIconBoxBg,
        border:          `${s.pdfIconBoxBorderWidth}px solid ${s.pdfIconBoxBorderColor}`,
      }}
    >
      <span
        style={{
          fontFamily:    '"Source Sans 3", sans-serif',
          fontWeight:    s.pdfIconFontWeight,
          fontSize:      s.pdfIconFontSize,
          lineHeight:    `${s.pdfIconLineHeight}px`,
          letterSpacing: '0.02em',
          color:         s.pdfIconColor,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── FileRow (internal) ───────────────────────────────────────────────────────

interface FileRowProps {
  doc:      UploadedDocument;
  onView:   (doc: UploadedDocument) => void;
  onRetry:  (clientId: string) => void;
  onRemove: (clientId: string) => void;
}

function FileRow({ doc, onView, onRetry, onRemove }: FileRowProps) {
  const isError   = doc.status === 'error';
  const isSuccess = doc.status === 'success';

  return (
    <div
      style={{
        display:         'flex',
        flexDirection:   'row',
        alignItems:      'center',
        gap:             s.fileRowGap,
        padding:         `${s.fileRowPaddingV}px ${s.fileRowPaddingH}px`,
        backgroundColor: isError ? s.fileRowErrorBg : s.fileRowBg,
        borderBottom:    `${s.fileRowBorderWidth}px solid ${
          isError ? s.fileRowErrorBorderColor : s.fileRowBorderColor
        }`,
      }}
    >
      <FileIcon type={getFileIconType(doc.filename)} />

      {/* info column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontFamily:   '"Source Sans 3", sans-serif',
            fontWeight:   s.filenameFontWeight,
            fontSize:     s.filenameFontSize,
            lineHeight:   `${s.filenameLineHeight}px`,
            color:        s.filenameColor,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}
        >
          {doc.filename}
        </span>

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={metaText}>{formatFileSize(doc.size)}</span>

          {doc.status === 'uploading' && (
            <span style={{ ...metaText, fontStyle: 'italic' }}>Uploading…</span>
          )}

          {isError && (
            <>
              <span style={separator}>{s.metaSeparator}</span>
              <span style={{ ...metaText, fontWeight: 600, color: s.fileRowErrorTextColor }}>
                {doc.errorMessage ?? 'Upload failed'}
              </span>
            </>
          )}

          {isSuccess && (
            <>
              {doc.documentTag && (
                <>
                  <span style={separator}>{s.metaSeparator}</span>
                  <span
                    style={{
                      fontFamily:      '"Source Sans 3", sans-serif',
                      fontWeight:      s.tagFontWeight,
                      fontSize:        s.tagFontSize,
                      lineHeight:      `${s.tagLineHeight}px`,
                      color:           s.tagColor,
                      backgroundColor: s.tagBg,
                      border:          `${s.tagBorderWidth}px solid ${s.tagBorderColor}`,
                      padding:         '0.8px 6.8px',
                      whiteSpace:      'nowrap',
                    }}
                  >
                    {doc.documentTag}
                  </span>
                </>
              )}
              <span style={separator}>{s.metaSeparator}</span>
              <span style={{ ...metaText, fontSize: s.timestampFontSize, lineHeight: `${s.timestampLineHeight}px` }}>
                {doc.uploadedAt ? formatTimestamp(doc.uploadedAt) : 'Just now'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* actions */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: s.actionsGap, flexShrink: 0 }}>
        {isError && (
          <button
            type="button"
            onClick={() => onRetry(doc.clientId)}
            style={iconBtn}
            title="Retry upload"
            aria-label={`Retry upload of ${doc.filename}`}
          >
            <RotateCcw size={13} aria-hidden />
          </button>
        )}
        {isSuccess && (
          <button
            type="button"
            onClick={() => onView(doc)}
            style={iconBtn}
            title="View document"
            aria-label={`View ${doc.filename}`}
          >
            <Eye size={13} aria-hidden />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(doc.clientId)}
          style={iconBtn}
          title="Remove document"
          aria-label={`Remove ${doc.filename}`}
        >
          <Trash2 size={13} aria-hidden />
        </button>
      </div>
    </div>
  );
}

// ─── DropZoneArea (internal) ──────────────────────────────────────────────────

interface DropZoneAreaProps {
  isDragOver:  boolean;
  onDragOver:  (e: ReactDragEvent) => void;
  onDragLeave: () => void;
  onDrop:      (e: ReactDragEvent) => void;
  onClick:     () => void;
}

function DropZoneArea({ isDragOver, onDragOver, onDragLeave, onDrop, onClick }: DropZoneAreaProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload documents. Click or drag files into this area."
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid"
      style={{
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'stretch',
        gap:             s.dropZoneGap,
        paddingLeft:     s.dropZonePaddingH,
        paddingRight:    s.dropZonePaddingH,
        paddingTop:      s.dropZonePaddingT,
        paddingBottom:   s.dropZonePaddingB,
        cursor:          'pointer',
        backgroundColor: isDragOver ? s.activeBg : s.dropZoneBg,
        border:          isDragOver
          ? `${s.dropZoneBorderWidth}px solid ${s.activeBorderColor}`
          : `${s.dropZoneBorderWidth}px dashed ${s.dropZoneBorderColor}`,
      }}
    >
      {/* Announce drag state to AT users */}
      <span aria-live="polite" className="sr-only">
        {isDragOver ? 'Drop files to upload' : ''}
      </span>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <Paperclip size={s.dropZoneIconSize} color={s.primaryColor} />
        <span
          style={{
            fontFamily: '"Source Sans 3", sans-serif',
            fontWeight: s.primaryFontWeight,
            fontSize:   s.primaryFontSize,
            lineHeight: `${s.primaryLineHeight}px`,
            color:      s.primaryColor,
          }}
        >
          {s.primaryText}
        </span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span
          style={{
            fontFamily: '"Source Sans 3", sans-serif',
            fontWeight: s.hintFontWeight,
            fontSize:   s.hintFontSize,
            lineHeight: `${s.hintLineHeight}px`,
            color:      s.hintColor,
          }}
        >
          {s.hintText}
        </span>
      </div>
    </div>
  );
}

// ─── FileDropzone (exported) ──────────────────────────────────────────────────

export const FileDropzone = forwardRef<FileDropzoneHandle, FileDropzoneProps>(
  function FileDropzone({ value, onChange, accept = '.pdf,.docx,.xlsx,.png' }, ref) {
    const inputRef                    = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadDocument]            = useUploadDocumentMutation();

    // Mirror latest value in a ref so async callbacks always read current list
    const latestValueRef = useRef(value);
    latestValueRef.current = value;

    // File objects are not serializable — store them outside form state for retry
    const fileMapRef = useRef<Map<string, File>>(new Map());

    useImperativeHandle(ref, () => ({ openPicker: () => inputRef.current?.click() }), []);

    function updateEntry(clientId: string, update: Partial<UploadedDocument>) {
      const next = latestValueRef.current.map((d) =>
        d.clientId === clientId ? { ...d, ...update } : d,
      );
      latestValueRef.current = next;
      onChange(next);
    }

    async function doUpload(clientId: string, file: File) {
      updateEntry(clientId, { status: 'uploading' });
      try {
        const result = await uploadDocument({ file }).unwrap();
        updateEntry(clientId, {
          status:       'success',
          serverId:     result.id,
          presignedUrl: result.presignedUrl,
          uploadedAt:   result.uploadedAt,
          documentTag:  'Application Form',
        });
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ?? 'Upload failed';
        updateEntry(clientId, { status: 'error', errorMessage: message });
      }
    }

    function handleFiles(files: FileList | File[]) {
      const arr     = Array.from(files);
      const newDocs: UploadedDocument[] = arr.map((file) => ({
        clientId: crypto.randomUUID(),
        filename: file.name,
        size:     file.size,
        status:   'uploading' as const,
      }));
      arr.forEach((file, i) => fileMapRef.current.set(newDocs[i].clientId, file));
      const next = [...latestValueRef.current, ...newDocs];
      latestValueRef.current = next;
      onChange(next);
      void Promise.all(newDocs.map((doc, i) => doUpload(doc.clientId, arr[i])));
    }

    function handleRetry(clientId: string) {
      const file = fileMapRef.current.get(clientId);
      if (file) void doUpload(clientId, file);
    }

    function handleRemove(clientId: string) {
      fileMapRef.current.delete(clientId);
      const next = latestValueRef.current.filter((d) => d.clientId !== clientId);
      latestValueRef.current = next;
      onChange(next);
    }

    function handleView(doc: UploadedDocument) {
      if (doc.presignedUrl) window.open(doc.presignedUrl, '_blank', 'noopener,noreferrer');
    }

    return (
      <div
        style={{
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'stretch',
          gap:           s.sectionBodyGap,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files?.length) {
              handleFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />

        <DropZoneArea
          isDragOver={isDragOver}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
        />

        {value.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4px 0' }}>
            <span
              style={{
                fontFamily: '"Source Sans 3", sans-serif',
                fontWeight: s.emptyStateFontWeight,
                fontSize:   s.emptyStateFontSize,
                lineHeight: `${s.emptyStateLineHeight}px`,
                color:      s.emptyStateColor,
              }}
            >
              {s.emptyStateText}
            </span>
          </div>
        ) : (
          <div style={{ border: `${s.fileListBorderWidth}px solid ${s.fileListBorderColor}` }}>
            {value.map((doc) => (
              <FileRow
                key={doc.clientId}
                doc={doc}
                onView={handleView}
                onRetry={handleRetry}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);
