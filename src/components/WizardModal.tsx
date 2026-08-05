import React, { useEffect, useRef } from "react";
import { useAppmixer } from "@/contexts/AppmixerContextSimple";
import type { Flow } from "@/lib/appmixer-api-types";

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  flow: Flow | null;
  onComplete?: (flowId: string) => void;
}

export const WizardModal: React.FC<WizardModalProps> = ({
  isOpen,
  onClose,
  flow,
  onComplete,
}) => {
  const { isInitialized, appmixer } = useAppmixer();
  const widgetRef = useRef<any>(null);
  const onCloseRef = useRef(onClose);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCloseRef.current = onClose;
    onCompleteRef.current = onComplete;
  }, [onClose, onComplete]);

  useEffect(() => {
    if (!isOpen || !isInitialized || !appmixer || !flow) return;
    if (widgetRef.current) return;
    if (!appmixer.ui || typeof appmixer.ui.Wizard !== 'function') {
      console.error('Wizard widget not available in Appmixer SDK');
      return;
    }

    const handleCancel = () => {
      console.log('Wizard cancelled');
      onCloseRef.current();
    };

    const handleComplete = (result: any) => {
      console.log('Wizard completed:', result);
      const flowId = result?.flowId || flow.flowId;
      if (onCompleteRef.current && flowId) {
        onCompleteRef.current(flowId);
      }
      onCloseRef.current();
    };

    try {
      console.log('Initializing Wizard widget for flow:', flow.name);
      const widget = appmixer.ui.Wizard({
        options: {
          flowId: flow.flowId,
          showHeader: false,
          onComplete: handleComplete,
          onCancel: handleCancel,
          onError: (err: any) => {
            console.error('Wizard error:', err);
          },
        },
      });

      widgetRef.current = widget;

      if (typeof widget.on === 'function') {
        widget.on('cancel', handleCancel);
        widget.on('close', handleComplete);
      }

      widget.set('flowId', flow.flowId);
      widget.open();
      console.log('Wizard widget created successfully');
    } catch (err) {
      console.error('Failed to initialize Wizard widget:', err);
      widgetRef.current = null;
    }
  }, [isOpen, isInitialized, appmixer, flow]);

  useEffect(() => {
    if (isOpen || !widgetRef.current) return;
    const widget = widgetRef.current;
    widgetRef.current = null;
    try {
      if (typeof widget.close === 'function') widget.close();
    } catch (err) {
      console.warn('Error closing wizard widget:', err);
    }
    try {
      if (typeof widget.destroy === 'function') widget.destroy();
    } catch (err) {
      console.warn('Error destroying wizard widget:', err);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      const widget = widgetRef.current;
      widgetRef.current = null;
      if (!widget) return;
      try { widget.close?.(); } catch {}
      try { widget.destroy?.(); } catch {}
    };
  }, []);

  return null;
};
