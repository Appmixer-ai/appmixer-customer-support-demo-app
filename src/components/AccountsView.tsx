import React, { useEffect, useRef } from "react";
import { useAppmixer } from "@/contexts/AppmixerContextSimple";

export const AccountsView: React.FC = () => {
  const { isInitialized, appmixer } = useAppmixer();
  const accountsContainerRef = useRef<HTMLDivElement>(null);
  const accountsInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!isInitialized || !appmixer) {
      return;
    }

    // Use a slight delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      if (!accountsContainerRef.current) {
        console.error('Accounts container ref is not available');
        return;
      }

      // Clean up previous accounts instance if it exists
      if (accountsInstanceRef.current) {
        try {
          accountsInstanceRef.current.close?.();
        } catch (error) {
          console.error("Error closing previous accounts viewer:", error);
        }
        accountsInstanceRef.current = null;
      }

      // Clear the container
      accountsContainerRef.current.innerHTML = '';

      try {
        console.log('Initializing Accounts widget');

        // Create a new Accounts instance
        const accounts = appmixer.ui.Accounts({
          el: accountsContainerRef.current,
        });

        // Store the instance for cleanup
        accountsInstanceRef.current = accounts;

        // Open the accounts viewer
        accounts.open();

        console.log('Accounts widget created successfully');
      } catch (error) {
        console.error("Error initializing accounts viewer:", error);
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (accountsInstanceRef.current) {
        try {
          accountsInstanceRef.current.close?.();
        } catch (error) {
          console.error("Error closing accounts viewer during cleanup:", error);
        }
        accountsInstanceRef.current = null;
      }
    };
  }, [isInitialized, appmixer]);

  return (
    <div className="flex flex-col h-full">
      

      <div className="flex-1 overflow-hidden">
        {!isInitialized ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Initializing accounts viewer...</p>
            </div>
          </div>
        ) : (
          <div
            ref={accountsContainerRef}
            className="rounded-md border bg-background"
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              position: 'relative',
            }}
          />
        )}
      </div>
    </div>
  );
};
