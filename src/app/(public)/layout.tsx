import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { QuickOrderModal } from '@/components/site/quick-order-modal';
import { StickyCta } from '@/components/site/sticky-cta';
import { CookieConsent } from '@/components/site/cookie-consent';
import { PageViewTracker } from '@/components/site/page-view-tracker';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-grain overflow-x-clip">
      <SiteHeader />
      <main className="flex-1 pb-20 sm:pb-0">{children}</main>
      <SiteFooter />
      <QuickOrderModal />
      <StickyCta />
      <CookieConsent />
      <PageViewTracker />
    </div>
  );
}
