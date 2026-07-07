import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ContinueListeningRail } from "@/components/home/ContinueListeningRail";
import { TrendingBooksRail } from "@/components/home/TrendingBooksRail";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { NewReleasesGrid } from "@/components/home/NewReleasesGrid";
import { MostPopularCarousel } from "@/components/home/MostPopularCarousel";
import { PremiumBanner } from "@/components/home/PremiumBanner";
import { FadeInSection } from "@/components/shared/FadeInSection";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-24 sm:gap-20">
      <HeroCarousel />
      <FadeInSection>
        <ContinueListeningRail />
      </FadeInSection>
      <FadeInSection>
        <TrendingBooksRail />
      </FadeInSection>
      <FadeInSection>
        <CategoriesGrid />
      </FadeInSection>
      <FadeInSection>
        <FeaturedCollections />
      </FadeInSection>
      <FadeInSection>
        <NewReleasesGrid />
      </FadeInSection>
      <FadeInSection>
        <MostPopularCarousel />
      </FadeInSection>
      <FadeInSection>
        <PremiumBanner />
      </FadeInSection>
    </div>
  );
}
