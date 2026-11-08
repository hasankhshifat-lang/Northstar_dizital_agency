/**
 * SmileDesk's logo in the app: the Northstar "N" mark (public/brand/northstar-mark.png, cut from the
 * agency's logo). Where SmileDesk drew its mascot as the brand: the sign-in card, the first load.
 */
export function BrandMark({ size = 56, className = "" }: { size?: number; className?: string }) {
  // A plain <img>: a static file, the same in the window, a browser and a self-hosted install.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/northstar-mark.png" alt="SmileDesk" width={Math.round(size * (181 / 186))} height={size} className={className} draggable={false} />;
}
