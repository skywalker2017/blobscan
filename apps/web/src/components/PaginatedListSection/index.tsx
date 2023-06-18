import { useCallback, type FC, type ReactNode } from "react";
import { useRouter } from "next/router";

import { SectionCard } from "../Cards/SectionCard";
import { Dropdown, type DropdownProps } from "../Dropdown";
import { Pagination, type PaginationProps } from "../Pagination";

export type PaginatedListSectionProps = {
  header: ReactNode;
  items: ReactNode[];
  totalItems: number;
  page: number;
  pageSize: number;
};

const PAGE_SIZES = [10, 25, 50, 100];

export const PaginatedListSection: FC<PaginatedListSectionProps> = function ({
  header,
  items,
  totalItems,
  page,
  pageSize,
}) {
  const router = useRouter();

  const pages = Math.ceil(totalItems / pageSize);

  const handlePageSizeSelection = useCallback<DropdownProps["onChange"]>(
    (newPageSize: number) =>
      void router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          /**
           * Update the selected page to a lower value if we require less pages to show the
           * new amount of elements per page.
           */
          p: Math.min(Math.ceil(totalItems / newPageSize), page),
          ps: newPageSize,
        },
      }),
    [page, totalItems, router],
  );

  const handlePageSelection = useCallback<PaginationProps["onChange"]>(
    (newPage) =>
      void router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          p: newPage,
          ps: pageSize,
        },
      }),
    [pageSize, router],
  );

  return (
    <SectionCard
      header={
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          {header}
          <div className="w-full self-center sm:w-auto">
            <Pagination
              selected={page}
              pages={pages}
              onChange={handlePageSelection}
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="space-y-4">{items.map((i) => i)}</div>
        <div className="flex w-full flex-col items-center gap-3 text-sm md:flex-row md:justify-between">
          <div className="flex items-center justify-start gap-2">
            Displayed items:
            <Dropdown
              items={PAGE_SIZES}
              selected={pageSize}
              onChange={handlePageSizeSelection}
            />
          </div>
          <div className="w-full sm:w-auto">
            <Pagination
              selected={page}
              pages={pages}
              inverseCompact
              onChange={handlePageSelection}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export { Skeleton as PaginatedListSectionSkeleton } from "./Skeleton";