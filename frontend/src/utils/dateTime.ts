export const parseClassTime = (timeString: string): Date => {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    }
    
    const date = new Date();
    date.setHours(hour, parseInt(minutes), 0);
    return date;
  };
  
  export const isTimeInRange = (time: Date, rangeStart: Date, rangeEnd: Date): boolean => {
    return time >= rangeStart && time <= rangeEnd;
  };
  
  export const getClassTimeRange = (classTime: string): { startTime: Date; endTime: Date } => {
    const baseTime = parseClassTime(classTime);
    return {
      startTime: new Date(baseTime.getTime() - 15 * 60000), // 15 minutes before
      endTime: new Date(baseTime.getTime() + 75 * 60000),   // 75 minutes after
    };
  };