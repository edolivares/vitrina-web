import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navigation, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

export default function PostImageGallery({ images, title }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950">
        <Swiper
          modules={[Navigation, Thumbs]}
          loop
          navigation={{
            prevEl: '.post-gallery-prev',
            nextEl: '.post-gallery-next'
          }}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          className="h-full w-full"
        >
          {images.map((image, index) => (
            <SwiperSlide key={image}>
              <img
                src={image}
                alt={`${title} - imagen ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          className="post-gallery-prev absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/70 text-slate-200 opacity-0 backdrop-blur transition hover:bg-slate-900 group-hover:opacity-100"
          aria-label="Imagen anterior"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          className="post-gallery-next absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/70 text-slate-200 opacity-0 backdrop-blur transition hover:bg-slate-900 group-hover:opacity-100"
          aria-label="Imagen siguiente"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <Swiper
        modules={[Thumbs]}
        onSwiper={setThumbsSwiper}
        slidesPerView="auto"
        watchSlidesProgress
        spaceBetween={12}
        className="post-gallery-thumbs"
      >
        {images.map((image, index) => (
          <SwiperSlide key={image} className="!size-16 cursor-pointer overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950 transition [&.swiper-slide-thumb-active]:border-indigo-500 [&.swiper-slide-thumb-active]:ring-2 [&.swiper-slide-thumb-active]:ring-indigo-500/20">
            <img src={image} alt={`Miniatura ${index + 1}`} className="h-full w-full object-cover" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
