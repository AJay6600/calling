import { apiClient } from '../utils';

export type MakeCallResponseType = {
  executionId: string;
  status: string;
};

export const triggerCall = async (
  recipientPhoneNumber: string,
): Promise<MakeCallResponseType> => {
  const { data } = await apiClient.post<MakeCallResponseType>('/api/calls', {
    recipientPhoneNumber,
  });

  return data;
};
