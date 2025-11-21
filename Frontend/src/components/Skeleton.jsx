// Skeleton Loading Components

export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
    <div className="h-56 skeleton-shimmer" />
    <div className="p-4 space-y-3">
      <div className="h-4 skeleton-shimmer rounded w-3/4" />
      <div className="h-3 skeleton-shimmer rounded w-1/2" />
      <div className="flex justify-between items-center mt-4">
        <div className="h-6 skeleton-shimmer rounded w-20" />
        <div className="h-4 skeleton-shimmer rounded w-16" />
      </div>
      <div className="h-10 skeleton-shimmer rounded-xl mt-3" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {[...Array(count)].map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="grid md:grid-cols-2 gap-8">
    <div className="space-y-4">
      <div className="h-96 skeleton-shimmer rounded-2xl" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-20 h-20 skeleton-shimmer rounded-lg" />
        ))}
      </div>
    </div>
    <div className="space-y-4">
      <div className="h-8 skeleton-shimmer rounded w-3/4" />
      <div className="h-4 skeleton-shimmer rounded w-1/4" />
      <div className="h-10 skeleton-shimmer rounded w-1/3" />
      <div className="h-24 skeleton-shimmer rounded" />
      <div className="h-12 skeleton-shimmer rounded-xl w-1/2" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4">
        {[...Array(cols)].map((_, j) => (
          <div key={j} className="flex-1 h-10 skeleton-shimmer rounded" />
        ))}
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 skeleton-shimmer rounded-2xl" />
      ))}
    </div>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="h-80 skeleton-shimmer rounded-2xl" />
      <div className="h-80 skeleton-shimmer rounded-2xl" />
    </div>
  </div>
);

export const CartSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl">
        <div className="w-24 h-24 skeleton-shimmer rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-5 skeleton-shimmer rounded w-3/4" />
          <div className="h-4 skeleton-shimmer rounded w-1/4" />
          <div className="h-6 skeleton-shimmer rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

export default { ProductCardSkeleton, ProductGridSkeleton, ProductDetailSkeleton, TableSkeleton, DashboardSkeleton, CartSkeleton };