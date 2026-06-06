import axios from 'axios';

export const API_UNREACHABLE_MESSAGE = "Can't reach the shop API — is the server running?";

const isProxyOrGatewayStatus = (status: number): boolean =>
  status === 500 || (status >= 502 && status <= 504);

export const isApiUnreachableError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }
  if (!error.response) {
    return true;
  }
  const status = error.response.status;
  if (!isProxyOrGatewayStatus(status)) {
    return false;
  }
  const data = error.response.data as { message?: string } | undefined;
  return typeof data?.message !== 'string' || data.message.length === 0;
};

export const isApiUnreachableMessage = (message: string | undefined): boolean =>
  message === API_UNREACHABLE_MESSAGE;

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (isApiUnreachableError(error)) {
      return API_UNREACHABLE_MESSAGE;
    }
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};
