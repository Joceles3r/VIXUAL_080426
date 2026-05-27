'use server';
import { USE_MOCK_DATA } from './feature-flags';
import * as Mock from './mock-data';
// ⚠️ Adapter le nom './db' selon votre client réel (prisma.ts, drizzle.ts, neon.ts, etc.)
import * as DB from './db'; 

export async function getUserData(userId: string, forceMock = false) {
  if (forceMock || USE_MOCK_DATA) return Mock.MOCK_USER;
  try { return await DB.getUserFromDB(userId); } 
  catch (e) { console.error('[DataProvider] Fallback mock:', e); return Mock.MOCK_USER; }
}

export async function getTransactions(userId: string, limit = 10, forceMock = false) {
  if (forceMock || USE_MOCK_DATA) return Mock.MOCK_TRANSACTIONS.slice(0, limit);
  try { return await DB.getTransactionsFromDB(userId, limit); } 
  catch (e) { console.error('[DataProvider] Fallback mock:', e); return Mock.MOCK_TRANSACTIONS.slice(0, limit); }
}

export async function getTrustScore(userId: string, forceMock = false) {
  if (forceMock || USE_MOCK_DATA) return Mock.MOCK_TRUST_SCORE;
  try { return await DB.getTrustScoreFromDB(userId); } 
  catch (e) { console.error('[DataProvider] Fallback mock:', e); return Mock.MOCK_TRUST_SCORE; }
}

export const isMockMode = () => USE_MOCK_DATA;
