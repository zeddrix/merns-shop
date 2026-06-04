import request from 'supertest';
import type { Application } from 'express';

type TestAgent = ReturnType<typeof request.agent>;
import { AUTH_COOKIE_NAME } from '../../../backend/utils/authCookie.js';

export function extractAuthTokenFromLoginResponse(
  setCookieHeader: string | string[] | undefined
): string {
  const cookieHeader = Array.isArray(setCookieHeader)
    ? setCookieHeader.join(';')
    : (setCookieHeader ?? '');
  const match = cookieHeader.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
  if (!match?.[1]) {
    throw new Error('Auth cookie missing from login response');
  }
  return match[1];
}

export async function getAuthToken(
  app: Application,
  email: string,
  password: string
): Promise<string> {
  const login = await request(app).post('/api/users/login').send({ email, password });
  if (login.status !== 200) {
    throw new Error(`Login failed for ${email}: ${login.status}`);
  }
  return extractAuthTokenFromLoginResponse(login.headers['set-cookie']);
}

export async function loginAgent(
  agent: TestAgent,
  email: string,
  password: string
): Promise<TestAgent> {
  const res = await agent.post('/api/users/login').send({ email, password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${res.status}`);
  }
  return agent;
}
