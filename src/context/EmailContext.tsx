import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { GmailStatus, SubscriptionItem } from '../types';
import * as emailApi from '../api/email';

interface EmailContextType {
  gmailStatus: GmailStatus;
  subscriptions: SubscriptionItem[];
  isConnecting: boolean;
  hasOnboarded: boolean;
  connect: () => Promise<void>;
  changeAccount: () => Promise<void>;
  disconnect: () => Promise<void>;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const ONBOARDING_KEY = 'nest_onboarded_v1';

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const EmailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gmailStatus, setGmailStatus] = useState<GmailStatus>({
    isConnected: false,
    emailAddress: null,
    lastScanned: null,
    receiptsCount: 0,
    subscriptionsCount: 0,
  });
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ONBOARDING_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const loadData = useCallback(async () => {
    try {
      const status = await emailApi.getGmailStatus();
      setGmailStatus(status);
      if (status.isConnected) {
        const subs = await emailApi.getSubscriptions();
        setSubscriptions(subs);
      } else {
        setSubscriptions([]);
      }
    } catch (err) {
      console.error('Failed to load email status', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const updated = await emailApi.connectGmail();
      setGmailStatus(updated);
      const subs = await emailApi.getSubscriptions();
      setSubscriptions(subs);
    } finally {
      setIsConnecting(false);
    }
  };

  const changeAccount = async () => {
    setIsConnecting(true);
    try {
      const updated = await emailApi.changeGmail();
      setGmailStatus(updated);
      const subs = await emailApi.getSubscriptions();
      setSubscriptions(subs);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    const updated = await emailApi.disconnectGmail();
    setGmailStatus(updated);
    setSubscriptions([]);
  };

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // ignore
    }
    setHasOnboarded(true);
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem(ONBOARDING_KEY);
    } catch {
      // ignore
    }
    setHasOnboarded(false);
  };

  return (
    <EmailContext.Provider
      value={{
        gmailStatus,
        subscriptions,
        isConnecting,
        hasOnboarded,
        connect,
        changeAccount,
        disconnect,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

export function useEmail(): EmailContextType {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
}

