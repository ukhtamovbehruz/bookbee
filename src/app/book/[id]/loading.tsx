import { Skeleton } from "@/components/ui/skeleton";

export default function BookDetailsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 sm:flex-row">
        <Skeleton className="mx-auto aspect-2/3 w-56 shrink-0 rounded-2xl sm:mx-0" />
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="mt-4 h-12 w-40 rounded-full" />
        </div>
      </div>
      <Skeleton className="mt-10 h-24 w-full max-w-3xl" />
    </div>
  );
}
