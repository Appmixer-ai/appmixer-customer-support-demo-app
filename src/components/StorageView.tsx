import React, { useEffect, useRef } from "react";
import { useAppmixer } from "@/contexts/AppmixerContextSimple";

export const StorageView: React.FC = () => {
  const { isInitialized, appmixer } = useAppmixer();
  const storageContainerRef = useRef<HTMLDivElement>(null);
  const storageInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!isInitialized || !appmixer) {
      return;
    }

    // Use a slight delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      if (!storageContainerRef.current) {
        console.error('Storage container ref is not available');
        return;
      }

      // Clean up previous storage instance if it exists
      if (storageInstanceRef.current) {
        try {
          storageInstanceRef.current.close?.();
        } catch (error) {
          console.error("Error closing previous storage viewer:", error);
        }
        storageInstanceRef.current = null;
      }

      // Clear the container
      storageContainerRef.current.innerHTML = '';

      try {
        console.log('Initializing Storage widget');

        // Create a new Storage instance
        const storage = appmixer.ui.Storage({
          el: storageContainerRef.current,
        });

        // Store the instance for cleanup
        storageInstanceRef.current = storage;

        // Open the storage viewer
        storage.open();

        console.log('Storage widget created successfully');
      } catch (error) {
        console.error("Error initializing storage viewer:", error);
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (storageInstanceRef.current) {
        try {
          storageInstanceRef.current.close?.();
        } catch (error) {
          console.error("Error closing storage viewer during cleanup:", error);
        }
        storageInstanceRef.current = null;
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
              <p className="text-muted-foreground">Initializing storage viewer...</p>
            </div>
          </div>
        ) : (
          <div
            ref={storageContainerRef}
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
