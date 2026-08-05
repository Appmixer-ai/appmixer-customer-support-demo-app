import React, { useEffect, useRef, useState } from "react";
import { useAppmixer } from "@/contexts/AppmixerContextSimple";


interface IntegrationsSectionProps {
  isHighlightingAppmixer?: boolean;
  onIntegrationClick?: (integration: {
    name: string;
    type: string;
    isActive: boolean;
  }) => void;
}

const IntegrationsSection: React.FC<IntegrationsSectionProps> = ({
  isHighlightingAppmixer = false,
  onIntegrationClick = () => {},
}) => {
  const { isInitialized, appmixer, error } = useAppmixer();
  const integrationsRef = useRef<HTMLDivElement>(null);
  const [widgetInitialized, setWidgetInitialized] = useState(false);
  const [integrationWidget, setIntegrationWidget] = useState<any>(null);

  useEffect(() => {
    if (isInitialized && appmixer && integrationsRef.current && !widgetInitialized) {
      try {
        console.log('Attempting to initialize Integrations widget');
        console.log('Appmixer object:', appmixer);
        console.log('Appmixer.ui:', appmixer.ui);
        console.log('Available UI methods:', appmixer.ui ? Object.keys(appmixer.ui) : 'No UI object');
        
        // Try different approaches to initialize the widget
        let widget = null;
        
        if (appmixer.ui && typeof appmixer.ui.Integrations === 'function') {
          console.log('Creating Integrations widget with element:', integrationsRef.current);
          
          widget = appmixer.ui.Integrations({
            el: integrationsRef.current,
            options: {
              showHeader: true,
            }
          });
          
          console.log('Widget created successfully:', widget);
          console.log('Widget methods:', widget ? Object.keys(widget) : 'No widget returned');
        } 
        else {
          console.warn('No suitable widget constructor found. Available UI methods:', 
            appmixer.ui ? Object.keys(appmixer.ui) : 'No UI object');
          
          // For now, create a placeholder
          if (integrationsRef.current) {
            integrationsRef.current.innerHTML = `
              <div class="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                <h3 class="text-lg font-semibold mb-2">Appmixer SDK Loaded</h3>
                <p class="text-gray-600 mb-4">SDK is available but widget API differs from documentation.</p>
                <pre class="text-xs bg-gray-100 p-2 rounded text-left">${JSON.stringify(appmixer.ui ? Object.keys(appmixer.ui) : {}, null, 2)}</pre>
              </div>
            `;
          }
          return;
        }
        
        if (!widget) {
          console.error('Widget initialization failed');
          return;
        }

        console.log('Setting up widget event handlers...');

        // Set up event handlers
        if (typeof widget.on === 'function') {
          widget.on('integration:create', (templateId: string) => {
            console.log('Integration created with template ID:', templateId);
          
          // Optional: Open wizard for configuration
          if (appmixer.ui.Wizard) {
            const wizard = appmixer.ui.Wizard();
            wizard.set('flowId', templateId);
            wizard.open();
          }
        });

        widget.on('integration:activate', (integrationData: any) => {
          console.log('Integration activated:', integrationData);
          onIntegrationClick(integrationData);
        });

          widget.on('error', (err: any) => {
            console.error('Appmixer widget error:', err);
          });

          console.log('Event handlers set up successfully');
        } else {
          console.warn('Widget does not have .on method for event handling');
        }

        setIntegrationWidget(widget);
        setWidgetInitialized(true);
        widget.open();
        console.log('Widget initialization completed');
      } catch (err) {
        console.error('Failed to initialize Appmixer Integrations widget:', err);
      }
    }
  }, [isInitialized, appmixer, widgetInitialized, onIntegrationClick]);

  // Cleanup widget on unmount
  useEffect(() => {
    return () => {
      if (integrationWidget) {
        try {
          integrationWidget.close?.();
        } catch (err) {
          console.error('Error closing integration widget:', err);
        }
      }
    };
  }, [integrationWidget]);

  if (error) {
    return (
      <div
        className={`space-y-6 relative ${isHighlightingAppmixer ? "appmixer-highlight-overlay" : ""}`}
        style={{
          padding: "15px 15px 45px",
          opacity: isHighlightingAppmixer ? 1 : undefined,
          
        }}
      >
        <div className="flex items-center justify-center h-96 text-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">Appmixer Integration Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
        {isHighlightingAppmixer && (
          <img
            src={`https://cdn.builder.io/api/v1/image/assets%2F${import.meta.env.VITE_BUILDER_IO_PROJECT_ID || '30d17f7f0f65497789306b2ad9a1c9a1'}%2F73ed1410c2c24ed397e35b4c7efa3d04?format=webp&width=800`}
            alt="Logo"
            className="absolute bottom-4 right-4 w-6 h-6 object-contain opacity-50"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 relative ${isHighlightingAppmixer ? "appmixer-highlight-overlay" : ""}`}
      style={{
        padding: "15px 15px 45px",
        opacity: isHighlightingAppmixer ? 1 : undefined,
        
      }}
    >
      <div className="mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Integration Templates
          </h1>
          <p className="text-muted-foreground">
            Activate ready-made integrations in just a few clicks.
          </p>
        </div>
      </div>

      {isInitialized && (
        <div ref={integrationsRef} className="min-h-[600px] w-full" />
      )}

      {isHighlightingAppmixer && (
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F30d17f7f0f65497789306b2ad9a1c9a1%2F73ed1410c2c24ed397e35b4c7efa3d04?format=webp&width=800"
          alt="Logo"
          className="absolute bottom-4 right-4 w-6 h-6 object-contain opacity-50"
        />
      )}
    </div>
  );
};

export default IntegrationsSection;