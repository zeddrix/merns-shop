import { describe, expect, it } from 'vitest';
import {
  API_UNREACHABLE_MESSAGE,
  getErrorMessage,
  isApiUnreachableError,
  isApiUnreachableMessage
} from '../../../frontend/src/utils/getErrorMessage';

const axiosNetworkError = () => ({
  isAxiosError: true,
  message: 'Network Error',
  code: 'ERR_NETWORK',
  response: undefined
});

const axiosGatewayError = (status: number) => ({
  isAxiosError: true,
  message: `Request failed with status code ${status}`,
  code: 'ERR_BAD_RESPONSE',
  response: {
    status,
    data: {},
    statusText: 'Bad Gateway',
    headers: {},
    config: {}
  }
});

const axiosApiError = (status: number, message: string) => ({
  isAxiosError: true,
  message: `Request failed with status code ${status}`,
  code: 'ERR_BAD_REQUEST',
  response: {
    status,
    data: { message },
    statusText: 'Not Found',
    headers: {},
    config: {}
  }
});

describe('getErrorMessage', () => {
  it('network_error_without_response_returns_api_unreachable_message', () => {
    const error = axiosNetworkError();
    expect(getErrorMessage(error)).toBe(API_UNREACHABLE_MESSAGE);
    expect(isApiUnreachableError(error)).toBe(true);
  });

  it('err_network_code_returns_api_unreachable_message', () => {
    const error = axiosNetworkError();
    expect(getErrorMessage(error)).toBe(API_UNREACHABLE_MESSAGE);
  });

  it('gateway_502_returns_api_unreachable_message', () => {
    const error = axiosGatewayError(502);
    expect(getErrorMessage(error)).toBe(API_UNREACHABLE_MESSAGE);
    expect(isApiUnreachableError(error)).toBe(true);
  });

  it('vite_proxy_500_without_message_returns_api_unreachable_message', () => {
    const error = axiosGatewayError(500);
    expect(getErrorMessage(error)).toBe(API_UNREACHABLE_MESSAGE);
    expect(isApiUnreachableError(error)).toBe(true);
  });

  it('api_json_message_still_preferred_when_response_exists', () => {
    const error = axiosApiError(404, 'Product not found');
    expect(getErrorMessage(error)).toBe('Product not found');
    expect(isApiUnreachableError(error)).toBe(false);
  });

  it('non_axios_error_falls_back_to_error_message', () => {
    expect(getErrorMessage(new Error('Not authenticated'))).toBe('Not authenticated');
    expect(isApiUnreachableError(new Error('Not authenticated'))).toBe(false);
  });

  it('isApiUnreachableMessage_matches_constant_only', () => {
    expect(isApiUnreachableMessage(API_UNREACHABLE_MESSAGE)).toBe(true);
    expect(isApiUnreachableMessage('Network Error')).toBe(false);
    expect(isApiUnreachableMessage('Product not found')).toBe(false);
  });
});
