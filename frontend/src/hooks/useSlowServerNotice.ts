import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectIsCatalogApiLoading } from '../features/catalogLoadingSelectors';
import { isSlowServerSessionWarmed, markSlowServerSessionWarmed } from '../utils/slowServerSession';
import { useSlowLoadingNotice } from './useSlowLoadingNotice';

export const useSlowServerNotice = (): boolean => {
  const isCatalogLoading = useAppSelector(selectIsCatalogApiLoading);
  const showSlowNotice = useSlowLoadingNotice(isCatalogLoading);
  const [sessionWarmed, setSessionWarmed] = useState(isSlowServerSessionWarmed);
  const hadSlowLoadRef = useRef(false);

  useEffect(() => {
    if (showSlowNotice) {
      hadSlowLoadRef.current = true;
    }
  }, [showSlowNotice]);

  useEffect(() => {
    if (!isCatalogLoading && hadSlowLoadRef.current) {
      markSlowServerSessionWarmed();
      setSessionWarmed(true);
      hadSlowLoadRef.current = false;
    }
  }, [isCatalogLoading]);

  return showSlowNotice && !sessionWarmed;
};
