import alovaInstance from '../alovaInstance';

export const fetchAppraisalFineList = params => alovaInstance.Get('/appraisal/list', { params });
