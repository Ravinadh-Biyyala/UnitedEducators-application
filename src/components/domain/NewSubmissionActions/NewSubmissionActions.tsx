import { ArrowLeft, Plus } from 'lucide-react';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { actionsRegionStyles } from '@/theme/tokens';

interface NewSubmissionActionsProps {
  validationMessage: string | null;
  isSubmitBlocked:   boolean;
  submitError:       string | null;
  isSubmitting:      boolean;
  onCreateClick:     () => void;
  onCancelClick:     () => void;
}

export function NewSubmissionActions({
  validationMessage,
  isSubmitBlocked,
  submitError,
  isSubmitting,
  onCreateClick,
  onCancelClick,
}: NewSubmissionActionsProps) {
  return (
    <div className="flex flex-col" style={{ gap: actionsRegionStyles.itemSpacing }}>
      {submitError ? (
        <Alert variant="error">{submitError}</Alert>
      ) : validationMessage ? (
        <Alert variant="warning">{validationMessage}</Alert>
      ) : null}

      <Button
        variant="primary"
        fullWidth
        leftIcon={!isSubmitting ? <Plus size={15} /> : undefined}
        onClick={onCreateClick}
        loading={isSubmitting}
        disabled={isSubmitBlocked}
      >
        {isSubmitting ? 'Creating…' : 'Create Submission'}
      </Button>

      <Button
        variant="secondary"
        fullWidth
        leftIcon={<ArrowLeft size={13} />}
        onClick={onCancelClick}
      >
        Cancel
      </Button>
    </div>
  );
}
