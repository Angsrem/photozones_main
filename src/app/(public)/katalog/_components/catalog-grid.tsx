import * as React from 'react';
import type { PhotoZone } from '@prisma/client';
import { PhotozoneCard } from '@/components/site/photozone-card';
import { StaggerGroup, StaggerItem } from '../../_components/home-reveal';
import { CatalogCardTilt } from './catalog-card-tilt';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Адаптивная сетка карточек каталога с scroll-reveal + tilt на hover.
 *
 * grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4
 * Карточки появляются последовательно (StaggerGroup/StaggerItem из home-reveal).
 * Каждая обёрнута в CatalogCardTilt для лёгкого 3D-наклона при наведении (desktop, pointer fine).
 *
 * Skeleton placeholder — показывается когда loading=true (для будущих Suspense/lazy grid).
 */
export function CatalogGrid({
  zones,
  loading = false,
  skeletonCount = 8,
}: {
  zones: PhotoZone[];
  loading?: boolean;
  skeletonCount?: number;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="p-4 flex flex-col gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <StaggerGroup
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      stagger={0.06}
    >
      {zones.map((pz, i) => (
        <StaggerItem key={pz.id}>
          <CatalogCardTilt>
            <PhotozoneCard pz={pz} index={i} />
          </CatalogCardTilt>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
