import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();
  const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            style={{
              width: isLoginPage ? "560px" : "760px",
              ...props.style,
            }}
          >
            <div
              className={`flex w-full gap-1 ${isLoginPage ? "flex-col" : "flex-col"}`}
            >
              <div className="flex items-center justify-between w-auto self-start">
                <div className="grid gap-2 flex-1">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription >
                      {description}
                    </ToastDescription>
                  )}
                </div>
                {action}
              </div>
              <div
                className={`text-xs space-y-0.5 ${isLoginPage ? "flex flex-col gap-1" : "flex flex-col gap-1"}`}
              >
                <div className="font-light mt-1">
                  Powered by Appmixer
                </div>
                <div className="relative">
                  <ToastClose className="absolute top-0 right-0" />
                  <img
                    src={`https://cdn.builder.io/api/v1/image/assets%2F${import.meta.env.VITE_BUILDER_IO_PROJECT_ID || '30d17f7f0f65497789306b2ad9a1c9a1'}%2F73ed1410c2c24ed397e35b4c7efa3d04?format=webp&width=800`}
                    alt="Logo"
                    className="absolute bottom-0 right-0 w-4 h-4 object-contain"
                  />
                </div>
              </div>
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
