import React, { useEffect, useRef } from "react";
import { useAppmixer } from "@/contexts/AppmixerContextSimple";

export const TasksView: React.FC = () => {
  const { isInitialized, appmixer } = useAppmixer();
  const tasksContainerRef = useRef<HTMLDivElement>(null);
  const tasksInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!isInitialized || !appmixer) {
      return;
    }

    // Use a slight delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      if (!tasksContainerRef.current) {
        console.error('Tasks container ref is not available');
        return;
      }

      // Clean up previous tasks instance if it exists
      if (tasksInstanceRef.current) {
        try {
          tasksInstanceRef.current.close?.();
        } catch (error) {
          console.error("Error closing previous tasks viewer:", error);
        }
        tasksInstanceRef.current = null;
      }

      // Clear the container
      tasksContainerRef.current.innerHTML = '';

      try {
        console.log('Initializing PeopleTasks widget');

        // Create a new PeopleTasks instance
        const peopleTasks = appmixer.ui.PeopleTasks({
          el: tasksContainerRef.current,
        });

        // Store the instance for cleanup
        tasksInstanceRef.current = peopleTasks;

        // Open the tasks viewer
        peopleTasks.open();

        console.log('PeopleTasks widget created successfully');
      } catch (error) {
        console.error("Error initializing tasks viewer:", error);
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (tasksInstanceRef.current) {
        try {
          tasksInstanceRef.current.close?.();
        } catch (error) {
          console.error("Error closing tasks viewer during cleanup:", error);
        }
        tasksInstanceRef.current = null;
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
              <p className="text-muted-foreground">Initializing tasks viewer...</p>
            </div>
          </div>
        ) : (
          <div
            ref={tasksContainerRef}
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
