import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Appmixer, FlowManager, Designer, Integrations, Wizard, InsightsLogs, Accounts, PeopleTasks, Storage, AutomationHub } from '../lib/appmixer/appmixer.es.js'; // Adjust import based on your SDK setup
import { ensureUserApiKey, ensureAppmixerVirtualUser, ensureAppmixerServiceAccount } from '../lib/appmixer-auth';

interface AppmixerContextType {
  isInitialized: boolean;
  appmixer: any;
  error: string | null;
  userApiKey: string | null;
}

const AppmixerContext = createContext<AppmixerContextType | undefined>(undefined);

export const useAppmixer = () => {
  const context = useContext(AppmixerContext);
  if (context === undefined) {
    throw new Error('useAppmixer must be used within an AppmixerProvider');
  }
  return context;
};

interface AppmixerProviderProps {
  children: React.ReactNode;
}

export const AppmixerProvider = ({ children }: AppmixerProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [appmixer, setAppmixer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const { user } = useAuth();
  const initializedForUserRef = useRef<string | null>(null);

  const APPMIXER_BASE_URL: string = import.meta.env.VITE_APPMIXER_BASE_URL || "https://api.pumped-jackass-32081.appmixer.cloud";
  // Base URL for the demo app API (used for service account injection)
  const APP_API_BASE_URL: string = import.meta.env.VITE_APP_API_BASE_URL || window.location.origin;

  useEffect(() => {
    console.log('AppmixerProvider effect running');
    if (!user) {
      console.warn('No user found, skipping Appmixer initialization');
      initializedForUserRef.current = null;
      return;
    }

    // Skip re-initialization if already initialized for this user
    if (initializedForUserRef.current === user.id) {
      return;
    }

    const initAppmixerSDK = async () => {
      const appmixer = new Appmixer({
        baseUrl: APPMIXER_BASE_URL,
        debug: Boolean(import.meta.env.VITE_APPMIXER_DEBUG) || false,
      });

      try {
        // Step 1: Ensure user has an API key stored in Supabase
        const apiKey = await ensureUserApiKey(user.id);
        setUserApiKey(apiKey);

        // Step 2: Ensure user has an Appmixer virtual account (using API key as password)
        await ensureAppmixerVirtualUser(appmixer, user.id, apiKey);

        // Step 3: Inject service account so user doesn't need to re-authenticate in workflows
        await ensureAppmixerServiceAccount(appmixer, apiKey, APP_API_BASE_URL);

        appmixer.set("theme", {
          mode: "light",

          variables: {
            font: {
              family:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              familyMono:
                "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
              size: 14,
            },
            colors: {
              background: "#ffffff", // Light background color matching the app theme
              primary: "#1c1917", // Dark slate primary color matching the app theme
              secondary: "#f8fafc", // Light secondary color matching the app
              success: "#22c55e", // Green success color
              warning: "#f59e0b", // Amber warning color
              error: "#ef4444", // Red error color
              surface: "#ffffff", // White background surface color
              neutral: "#0f172a", // Dark slate text color
            },
            corners: {
              elementRadiusSmall: "4px",
              elementRadiusMedium: "6px",
              elementRadiusLarge: "8px",
              containerRadiusSmall: "4px",
              containerRadiusMedium: "6px",
              containerRadiusLarge: "8px",
            },
            dividers: {
              regular: "1px",
              medium: "4px",
              semibold: "6px",
              bold: "6px",
              extrabold: "9px",
            },
          },
        });

        appmixer.set("strings", {
          ui: {
            flowManager: {
              header: {
                title: " "
              }
            },
            integrations: {
              title: " ",
            },
          }
        });


        appmixer.ui("Designer", Designer);
        appmixer.ui("FlowManager", FlowManager);
        appmixer.ui("Integrations", Integrations);
        appmixer.ui("Wizard", Wizard);
        appmixer.ui("InsightsLogs", InsightsLogs);
        appmixer.ui("Accounts", Accounts);
        appmixer.ui("PeopleTasks", PeopleTasks);
        appmixer.ui("Storage", Storage);
        appmixer.ui("AutomationHub", AutomationHub);
        setAppmixer(appmixer);
        setIsInitialized(true);
        initializedForUserRef.current = user.id;
      } catch (error) {
        setIsInitialized(false);
        console.error('Authentication failed:', error);
        setError('Failed to authenticate with Appmixer');
      }
    };

    initAppmixerSDK();
  }, [user]);

  const value: AppmixerContextType = {
    isInitialized,
    appmixer,
    error,
    userApiKey,
  };

  return React.createElement(AppmixerContext.Provider, { value }, children);
};