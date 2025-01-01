import { useState, useEffect } from 'react';

export const useClassActivity = (classTime: string) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkActivity = () => {
      const now = new Date();
      const [time, period] = classTime.split(' ');
      const [hours, minutes] = time.split(':');
      
      let classHour = parseInt(hours);
      if (period === 'PM' && classHour !== 12) {
        classHour += 12;
      } else if (period === 'AM' && classHour === 12) {
        classHour = 0;
      }

      const classDate = new Date();
      classDate.setHours(classHour);
      classDate.setMinutes(parseInt(minutes));

      // Class is active 5 minutes before and 60 minutes after start time
      const startTime = new Date(classDate.getTime() - 5 * 60000);
      const endTime = new Date(classDate.getTime() + 60 * 60000);

      setIsActive(now >= startTime && now <= endTime);
    };

    checkActivity();
    const interval = setInterval(checkActivity, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [classTime]);

  return isActive;
};