import { BackgroundPattern } from "@/components/site/shared/BackgroundPattern";
import { HeaderNav } from "@/components/site/HeaderNav";
import { Hero } from "@/components/site/Hero";
import { Historia } from "@/components/site/Historia";
import { Partidos } from "@/components/site/Partidos";
import { Calendario } from "@/components/site/Calendario";
import Plantilla from "@/components/site/Plantilla";
import Podios from "@/components/site/Podios";
import Uniformes from "@/components/site/Uniformes";
import Tienda from "@/components/site/Tienda";
import { ComingSoon } from "@/components/site/ComingSoon";
import { Footer } from "@/components/site/Footer";
import {
  getSiteSettings,
  getAllMatches,
  getRoster,
  getFullRoster,
  getAllGoals,
  getShopProducts,
  getKitImages,
} from "@/lib/site-data";

export default async function HomePage() {
  const [settings, matches, roster, fullRoster, allGoals, shop, kits] = await Promise.all([
    getSiteSettings(),
    getAllMatches(),
    getRoster(),
    getFullRoster(),
    getAllGoals(),
    getShopProducts(),
    getKitImages(),
  ]);
  const now = new Date();

  return (
    <div className="relative mx-auto min-h-screen max-w-[480px] overflow-x-hidden bg-cream lg:max-w-none">
      <BackgroundPattern patternUrl={settings.patternUrl} />
      <HeaderNav crestUrl={settings.teamCrestUrl} />
      <Hero heroVideoUrl={settings.heroVideoUrl} taglineHtml={settings.taglineHtml} />
      <Historia p1={settings.historiaP1} p2={settings.historiaP2} />
      <Partidos matches={matches} now={now} teamCrestUrl={settings.teamCrestUrl} />
      <Calendario matches={matches} now={now} ligaNombre={settings.ligaNombre} />
      <Plantilla roster={fullRoster} allGoals={allGoals} />
      <Podios roster={roster} allGoals={allGoals} />
      <Uniformes kits={kits} />
      <Tienda products={shop} />
      <ComingSoon />
      <Footer crestUrl={settings.teamCrestUrl} />
    </div>
  );
}
