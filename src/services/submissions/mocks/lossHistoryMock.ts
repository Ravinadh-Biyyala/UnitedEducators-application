import type { LossHistoryRow } from '@/shared/types';

export const MOCK_LOSS_HISTORY: Record<string, LossHistoryRow[]> = {
  'SUB-7829': [
    { year: '2019', claims: 2, incurred: '$18,400', ratio: '22%', up: false },
    { year: '2020', claims: 1, incurred: '$9,100',  ratio: '11%', up: false },
    { year: '2021', claims: 3, incurred: '$24,700', ratio: '30%', up: true  },
    { year: '2022', claims: 2, incurred: '$16,500', ratio: '20%', up: false },
    { year: '2023', claims: 1, incurred: '$18,500', ratio: '22%', up: true  },
  ],
};

export const DEFAULT_LOSS_HISTORY: LossHistoryRow[] = MOCK_LOSS_HISTORY['SUB-7829'];
