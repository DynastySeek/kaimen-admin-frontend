import alovaInstance from '../alovaInstance';

export const fetchAppraisalList = params => alovaInstance.Get('/appraisal/list', { params });
