import type { Metadata } from 'next';
import './globals.css';
import { BottomNav }    from '@/components/layout/BottomNav';
import { StoreProvider } from '@/context/StoreContext';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'VendeMás',
  description: 'Gestión de precios en bolívares',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <StoreProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen max-w-[480px] mx-auto relative bg-bg">
              <main className="flex-1 overflow-y-auto pt-[var(--header-height)] pb-[calc(var(--nav-height)+16px)]">
                {children}
              </main>
              <BottomNav />
            </div>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
