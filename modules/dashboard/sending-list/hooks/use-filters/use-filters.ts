import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SendingType } from '~/constants/sending-type';
import { useQueryString } from '~/hooks/use-query-string';
import { SendingListQueryParams } from '~/interfaces/send-list-query-params';
import { SendingStatus } from '~/services/workspace/get-sending-list-by-workspace-id';
import { feedbackEnum } from '../../components/filters-modal/constants';
import { SendingListQueryString } from '../../interfaces';

export const useFilters = () => {
  const { workspaceId = '' } = useParams<{ workspaceId: string }>();
  const { queryStringAsObj } = useQueryString<SendingListQueryString>();

  const { startDate, endDate, type, search } = queryStringAsObj;
  const specialityCodeList = useMemo(() => {
    return queryStringAsObj.specialityCodeList?.split(',');
  }, [queryStringAsObj.specialityCodeList]);

  const doctorCodeList = useMemo(() => {
    return queryStringAsObj.doctorCodeList?.split(',');
  }, [queryStringAsObj.doctorCodeList]);

  const statusList = useMemo(() => {
    return queryStringAsObj.statusList?.split(',') as SendingStatus[];
  }, [queryStringAsObj.statusList]);

  const procedureCodeList = useMemo(() => {
    return queryStringAsObj.procedureCodeList?.split(',');
  }, [queryStringAsObj.procedureCodeList]);

  const cancelReasonList = useMemo(() => {
    return queryStringAsObj.cancelReasonList?.split(',');
  }, [queryStringAsObj.cancelReasonList]);

  const organizationUnitList = useMemo(() => {
    return queryStringAsObj.organizationUnitList?.split(',');
  }, [queryStringAsObj.organizationUnitList]);

  const insuranceCodeList = useMemo(() => {
    return queryStringAsObj.insuranceCodeList?.split(',');
  }, [queryStringAsObj.insuranceCodeList]);

  const insurancePlanCodeList = useMemo(() => {
    return queryStringAsObj.insurancePlanCodeList?.split(',');
  }, [queryStringAsObj.insurancePlanCodeList]);

  const npsScoreList = useMemo(() => {
    return queryStringAsObj.npsScoreList?.split(',');
  }, [queryStringAsObj.npsScoreList]);

  const feedback = useMemo(() => {
    return queryStringAsObj.feedback as feedbackEnum | undefined;
  }, [queryStringAsObj.feedback]);

  const filters = useMemo(() => {
    const baseFilters: SendingListQueryParams = {
      workspaceId,
      startDate,
      endDate,
      type: type || undefined,
      search: search || undefined,
      specialityCodeList: specialityCodeList || undefined,
      doctorCodeList: doctorCodeList || undefined,
      statusList: statusList || undefined,
      procedureCodeList: procedureCodeList || undefined,
      organizationUnitList: organizationUnitList || undefined,
      insuranceCodeList: insuranceCodeList || undefined,
      insurancePlanCodeList: insurancePlanCodeList || undefined,
    };

    if (type === undefined || type === SendingType.confirmation) {
      baseFilters.cancelReasonList = cancelReasonList || undefined;
    }

    if (type === undefined || type === SendingType.nps_score) {
      baseFilters.npsScoreList = npsScoreList || undefined;
      baseFilters.feedback = feedback || undefined;
    }

    return baseFilters;
  }, [
    workspaceId,
    startDate,
    endDate,
    type,
    search,
    specialityCodeList,
    doctorCodeList,
    statusList,
    procedureCodeList,
    organizationUnitList,
    insuranceCodeList,
    insurancePlanCodeList,
    cancelReasonList,
    npsScoreList,
    feedback,
  ]);

  return filters;
};
