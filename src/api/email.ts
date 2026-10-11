import type { GmailStatus, SubscriptionItem } from '../types';

/**
 * =========================================================================
 * GMAIL RECEIPT & SUBSCRIPTION DATA SERVICE
 * =========================================================================
 * Mock data service for scanning receipts and subscriptions from Gmail.
 * Read-only display data.
 * 
 * TO SWAP IN REAL GMAIL API:
 * 1. Implement Google OAuth2 web client (scope: https://www.googleapis.com/auth/gmail.readonly)
 * 2. Query messages: q='label:receipt OR subject:receipt OR from:spotify OR from:netflix'
 * 3. Extract transaction amounts and subscription recurring dates.
 * =========================================================================
 */

const STORAGE_KEY = 'nest_gmail_connection_v1';

const DEFAULT_STATUS: GmailStatus = {
  isConnected: false,
  emailAddress: null,
  lastScanned: null,
  receiptsCount: 0,
  subscriptionsCount: 0,
};

export const MOCK_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub_spotify',
    name: 'Spotify Premium',
    amount: 11.99,
    category: 'Music',
    nextBillingDate: '18 Oct',
  },
  {
    id: 'sub_netflix',
    name: 'Netflix Standard',
    amount: 10.99,
    category: 'Entertainment',
    nextBillingDate: '24 Oct',
  },
  {
    id: 'sub_icloud',
    name: 'Apple iCloud+ (50GB)',
    amount: 2.99,
    category: 'Cloud Storage',
    nextBillingDate: '02 Nov',
  },
];

function loadStatus(): GmailStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as GmailStatus;
    }
  } catch {
    // fallback
  }
  return DEFAULT_STATUS;
}

function saveStatus(status: GmailStatus): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
  } catch {
    // ignore
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getGmailStatus(): Promise<GmailStatus> {
  await delay(50);
  return loadStatus();
}

export async function connectGmail(email = 'student@gmail.com'): Promise<GmailStatus> {
  // Simulate OAuth connection and email scan (~1.5s)
  await delay(1500);

  const status: GmailStatus = {
    isConnected: true,
    emailAddress: email,
    lastScanned: 'just now',
    receiptsCount: 12,
    subscriptionsCount: 3,
  };

  saveStatus(status);
  return status;
}

export async function changeGmail(): Promise<GmailStatus> {
  // Simulate changing account (~1.5s)
  await delay(1500);

  const current = loadStatus();
  const alternateEmail = current.emailAddress === 'student@gmail.com'
    ? 'alex.student@gmail.com'
    : 'student@gmail.com';

  const status: GmailStatus = {
    isConnected: true,
    emailAddress: alternateEmail,
    lastScanned: 'just now',
    receiptsCount: 14,
    subscriptionsCount: 3,
  };

  saveStatus(status);
  return status;
}

export async function disconnectGmail(): Promise<GmailStatus> {
  await delay(100);
  saveStatus(DEFAULT_STATUS);
  return DEFAULT_STATUS;
}

export async function getSubscriptions(): Promise<SubscriptionItem[]> {
  await delay(80);
  return MOCK_SUBSCRIPTIONS;
}

