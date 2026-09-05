'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function PhotozoneGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const safeImages = images.length ? images : ['/images/photozones/love.png'];
  const current = safeImages[active] ?? safeImages[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-card">
        <Image
          src={current}
          alt={`${title} — фото ${active + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
        />
      </div>
      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {safeImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Показать фото ${i + 1}`}
              aria-current={i === active}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                i === active
                  ? 'border-gold ring-2 ring-gold/30'
                  : 'border-border opacity-70 hover:opacity-100',
              )}
            >
              <Image
                src={img}
                alt={`${title} — превью ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
