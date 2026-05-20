import { useSearchParams } from 'react-router-dom';
import { MemberBrokerTab } from '@/components/domain/MemberBrokerTab';
import {
  useGetMemberDetailQuery,
  useGetBrokerageDetailQuery,
  useGetBrokerContactsQuery,
} from '@/services/submissions/submissionsApi';

interface MemberBrokerTabContainerProps {
  submissionId: string;
}

const VALID_VIEWS = ['member', 'brokerage'] as const;
type MemberView = typeof VALID_VIEWS[number];

function isValidView(v: string | null): v is MemberView {
  return VALID_VIEWS.includes(v as MemberView);
}

export function MemberBrokerTabContainer({ submissionId }: MemberBrokerTabContainerProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawView  = searchParams.get('memberView');
  const activeView: MemberView = isValidView(rawView) ? rawView : 'member';

  const { data: member,    isLoading: loadingMember    } = useGetMemberDetailQuery(submissionId);
  const { data: brokerage, isLoading: loadingBrokerage } = useGetBrokerageDetailQuery(submissionId);
  const { data: contacts,  isLoading: loadingContacts  } = useGetBrokerContactsQuery(submissionId);

  const onViewChange = (v: MemberView) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (v === 'member') {
        next.delete('memberView');
      } else {
        next.set('memberView', v);
      }
      return next;
    }, { replace: true });
  };

  if (loadingMember || loadingBrokerage || loadingContacts || !member || !brokerage || !contacts) {
    return null;
  }

  return (
    <MemberBrokerTab
      member={member}
      brokerage={brokerage}
      contacts={contacts}
      activeView={activeView}
      onViewChange={onViewChange}
    />
  );
}
