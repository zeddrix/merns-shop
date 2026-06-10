import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectIsApiInFlight } from '../features/apiLoadingSlice';
import { isSlowServerSessionWarmed, markSlowServerSessionWarmed } from '../utils/slowServerSession';
import { useSlowLoadingNotice } from './useSlowLoadingNotice';

export const useSlowServerNotice = (): boolean => {
  const isApiLoading = useAppSelector(selectIsApiInFlight);
  const showSlowNotice = useSlowLoadingNotice(isApiLoading);
  const [sessionWarmed, setSessionWarmed] = useState(isSlowServerSessionWarmed);
  const hadSlowLoadRef = useRef(false);

  useEffect(() => {
    if (showSlowNotice) {
      hadSlowLoadRef.current = true;
    }
  }, [showSlowNotice]);

  useEffect(() => {
    if (!isApiLoading && hadSlowLoadRef.current) {
      markSlowServerSessionWarmed();
      setSessionWarmed(true);
      hadSlowLoadRef.current = false;
    }
  }, [isApiLoading]);

  return showSlowNotice && !sessionWarmed;
};
