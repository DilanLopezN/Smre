import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryString } from '~/hooks/use-query-string';
import type { ApiError } from '~/interfaces/api-error';
import type { CancelingReasonMetric } from '~/interfaces/canceling-reason-metric';
import { getCancelingReasonMetrics } from '~/services/workspace/get-canceling-reason-metrics';
import { notifyError } from '~/utils/notify-error';
import { SendingListQueryString } from '../../interfaces';
import { useFilters } from '../use-filters';

export const useCancelingReasonMetrics = () => {
  const { workspaceId = '' } = useParams<{
    workspaceId: string;
  }>();
  const { queryStringAsObj } = useQueryString<SendingListQueryString>();
  const filters = useFilters();
  const [cancelingReasonMetrics, setCancelingReasonMetrics] = useState<CancelingReasonMetric[]>();
  const [isLoadingCancelingReasonMetrics, setIsLoadingCancelingReasonMetrics] = useState(false);
  const [cancelingReasonMetricsError, setCancelingReasonMetricsError] = useState<ApiError>();
  const { startDate, endDate } = queryStringAsObj;

  const fetchCancelingReasonMetrics = useCallback(async () => {
    if (!workspaceId || !startDate || !endDate) {
      return;
    }

    try {
      setIsLoadingCancelingReasonMetrics(true);
      const response = await getCancelingReasonMetrics(filters);
      setCancelingReasonMetrics(response);
      setIsLoadingCancelingReasonMetrics(false);
      return response;
    } catch (err) {
      const typedError = err as ApiError;
      setCancelingReasonMetricsError(typedError);
      setIsLoadingCancelingReasonMetrics(false);
      notifyError('Erro ao carregar métricas de cancelamento');
      return false;
    }
  }, [workspaceId, startDate, endDate, filters]);

  useEffect(() => {
    fetchCancelingReasonMetrics();
  }, [fetchCancelingReasonMetrics]);

  return {
    cancelingReasonMetrics,
    isLoadingCancelingReasonMetrics,
    cancelingReasonMetricsError,
    fetchCancelingReasonMetrics,
  };
};
