import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { bannerService } from "@/services/bannerService";
import type { Banner } from "@/types/banner";

const PromotionalBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    let isMounted = true;

    const loadBanners = async () => {
      try {
        setIsLoading(true);
        const data = await bannerService.list();

        if (isMounted) {
          setBanners(data);
        }
      } catch {
        if (isMounted) {
          setBanners([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!carouselApi || banners.length <= 1) {
      return;
    }

    const autoplayInterval = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 5500);

    return () => {
      window.clearInterval(autoplayInterval);
    };
  }, [carouselApi, banners.length]);

  if (isLoading) {
    return (
      <section className="py-10">
        <div className="flex items-center justify-center gap-3 px-4 text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          Cargando banners...
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: "start",
            loop: banners.length > 1,
          }}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {banners.map((banner, index) => (
              <CarouselItem key={banner.id} className="pl-0">
                <motion.article
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <img
                    src={banner.imagen.url}
                    alt={`Banner promocional ${banner.id}`}
                    loading="lazy"
                    className="aspect-[3.2/1] w-full object-cover md:aspect-[4.8/1]"
                  />
                </motion.article>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </motion.div>
    </section>
  );
};

export default PromotionalBanners;
