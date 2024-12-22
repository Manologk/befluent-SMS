import { useMemo } from 'react';
import { getClassTimeRange } from '@/utils/dateTime';

export const useClassActivity = (classTime: string) => {
  return useMemo(() => {
    const now = new Date();
    const { startTime, endTime } = getClassTimeRange(classTime);
    return now >= startTime && now <= endTime;
  }, [classTime]);
};