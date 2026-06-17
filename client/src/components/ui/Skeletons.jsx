import React from 'react';
import { motion } from 'framer-motion';

// Helper line skeleton
export const SkeletonLine = ({ width = '100%', height = '16px', className = '' }) => (
  <div className={`skeleton ${className}`} style={{ width, height }} />
);

// 1. ProductDetailSkeleton
export const ProductDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Product Image Skeleton */}
      <div className="aspect-square w-full skeleton rounded-md" />
      
      {/* Product Details Info Skeleton */}
      <div className="space-y-6">
        <div className="space-y-2">
          {/* Badge */}
          <SkeletonLine width="80px" height="24px" className="rounded-full" />
          {/* Title */}
          <SkeletonLine width="90%" height="40px" />
          <SkeletonLine width="60%" height="40px" />
        </div>

        {/* Rating & Seller info */}
        <div className="flex items-center gap-4 pt-2">
          <SkeletonLine width="120px" height="20px" />
          <div className="h-4 w-px bg-ash" />
          <SkeletonLine width="100px" height="20px" />
        </div>

        {/* Price block */}
        <div className="py-4 border-y border-ash space-y-2">
          <SkeletonLine width="140px" height="36px" />
          <SkeletonLine width="90px" height="16px" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <SkeletonLine width="100%" height="16px" />
          <SkeletonLine width="100%" height="16px" />
          <SkeletonLine width="80%" height="16px" />
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <SkeletonLine width="100px" height="48px" className="rounded-md" />
            <SkeletonLine width="100%" height="48px" className="rounded-md" />
          </div>
          <SkeletonLine width="180px" height="16px" />
        </div>
      </div>
    </div>
  </div>
);

// 2. CartSkeleton
export const CartSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <SkeletonLine width="180px" height="36px" className="mb-8" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items List */}
      <div className="lg:col-span-2 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 p-4 bg-pure-white border border-ash rounded-md">
            <div className="w-24 h-24 skeleton rounded-md shrink-0" />
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <SkeletonLine width="60%" height="20px" />
                  <SkeletonLine width="80px" height="20px" />
                </div>
                <SkeletonLine width="40%" height="16px" />
              </div>
              <div className="flex justify-between items-center mt-2">
                <SkeletonLine width="100px" height="32px" className="rounded-md" />
                <SkeletonLine width="60px" height="16px" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Cart Summary Panel */}
      <div className="bg-pure-white border border-ash rounded-md p-6 h-fit space-y-6">
        <SkeletonLine width="120px" height="24px" className="mb-4" />
        <div className="space-y-3 pt-2">
          <div className="flex justify-between">
            <SkeletonLine width="80px" height="16px" />
            <SkeletonLine width="60px" height="16px" />
          </div>
          <div className="flex justify-between">
            <SkeletonLine width="100px" height="16px" />
            <SkeletonLine width="50px" height="16px" />
          </div>
          <div className="border-t border-ash pt-3 flex justify-between">
            <SkeletonLine width="90px" height="20px" />
            <SkeletonLine width="70px" height="20px" />
          </div>
        </div>
        <SkeletonLine width="100%" height="48px" className="rounded-md pt-4" />
      </div>
    </div>
  </div>
);

// 3. OrdersSkeleton
export const OrdersSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-pure-white border border-ash rounded-md overflow-hidden">
        {/* Order Header */}
        <div className="bg-cream-paper border-b border-ash p-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-6">
            <div className="space-y-1">
              <div className="text-xs text-smoke font-graphik uppercase">Order Placed</div>
              <SkeletonLine width="100px" height="16px" />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-smoke font-graphik uppercase">Total</div>
              <SkeletonLine width="80px" height="16px" />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-smoke font-graphik uppercase">Ship To</div>
              <SkeletonLine width="90px" height="16px" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SkeletonLine width="140px" height="16px" />
            <SkeletonLine width="80px" height="24px" className="rounded-full" />
          </div>
        </div>
        {/* Order Items */}
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 skeleton rounded-md shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <SkeletonLine width="40%" height="18px" />
              <SkeletonLine width="20%" height="16px" />
            </div>
            <SkeletonLine width="100px" height="36px" className="rounded-md shrink-0" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// 4. ProfileSkeleton
export const ProfileSkeleton = () => (
  <div className="bg-pure-white border border-ash rounded-md p-6 space-y-6">
    <SkeletonLine width="140px" height="24px" className="mb-4" />
    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-ash">
      <div className="w-20 h-20 rounded-full skeleton shrink-0" />
      <div className="space-y-2 text-center sm:text-left flex-1">
        <SkeletonLine width="160px" height="22px" />
        <SkeletonLine width="120px" height="16px" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <SkeletonLine width="80px" height="16px" />
        <SkeletonLine width="100%" height="40px" className="rounded-md" />
      </div>
      <div className="space-y-2">
        <SkeletonLine width="100px" height="16px" />
        <SkeletonLine width="100%" height="40px" className="rounded-md" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <SkeletonLine width="40px" height="16px" />
        <SkeletonLine width="100%" height="40px" className="rounded-md" />
      </div>
    </div>
    <div className="flex justify-end pt-4">
      <SkeletonLine width="120px" height="40px" className="rounded-md" />
    </div>
  </div>
);

// 5. AddressSkeleton
export const AddressSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[1, 2].map((i) => (
      <div key={i} className="border border-ash bg-pure-white p-5 rounded-md space-y-3">
        <div className="flex justify-between items-start">
          <SkeletonLine width="100px" height="20px" className="rounded-full" />
          <div className="flex gap-2">
            <SkeletonLine width="32px" height="24px" className="rounded-md" />
            <SkeletonLine width="32px" height="24px" className="rounded-md" />
          </div>
        </div>
        <div className="space-y-2 pt-1">
          <SkeletonLine width="90%" height="16px" />
          <SkeletonLine width="80%" height="16px" />
          <SkeletonLine width="60%" height="16px" />
        </div>
      </div>
    ))}
  </div>
);

// 6. DashboardCardSkeleton
export const DashboardCardSkeleton = () => (
  <div className="bg-pure-white border border-ash p-6 rounded-md space-y-4">
    <div className="flex justify-between items-center">
      <SkeletonLine width="80px" height="16px" />
      <div className="w-8 h-8 rounded-full skeleton" />
    </div>
    <div className="space-y-1">
      <SkeletonLine width="120px" height="32px" />
      <SkeletonLine width="140px" height="14px" />
    </div>
  </div>
);

// 7. TableRowSkeleton
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="border-b border-ash last:border-0">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4 whitespace-nowrap">
        <SkeletonLine width={i === 0 ? '70%' : i === cols - 1 ? '60px' : '85%'} height="16px" />
      </td>
    ))}
  </tr>
);

// 8. DashboardSkeleton
export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Grid of Stat Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>

    {/* Section header & search/actions placeholder */}
    <div className="bg-pure-white border border-ash rounded-md p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SkeletonLine width="160px" height="24px" />
        <div className="flex gap-3 w-full sm:w-auto">
          <SkeletonLine width="180px" height="40px" className="rounded-md" />
          <SkeletonLine width="100px" height="40px" className="rounded-md" />
        </div>
      </div>

      {/* Table Placeholder */}
      <div className="overflow-x-auto border border-ash rounded-md">
        <table className="min-w-full divide-y divide-ash">
          <thead className="bg-cream-paper">
            <tr>
              {[1, 2, 3, 4, 5].map((i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <SkeletonLine width="80px" height="14px" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ash bg-pure-white">
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRowSkeleton key={i} cols={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// 9. CheckoutSkeleton
export const CheckoutSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <SkeletonLine width="140px" height="20px" />
      <SkeletonLine width="100px" height="32px" className="rounded-md" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="border border-ash p-4 rounded-md bg-pure-white space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full skeleton" />
            <SkeletonLine width="100px" height="18px" />
          </div>
          <div className="space-y-1 pl-7">
            <SkeletonLine width="90%" height="14px" />
            <SkeletonLine width="80%" height="14px" />
            <SkeletonLine width="60%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 10. HeroSkeleton
export const HeroSkeleton = () => (
  <div className="relative overflow-hidden bg-cream-paper border-b border-ash py-20 lg:py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Content column */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <SkeletonLine width="120px" height="24px" className="rounded-full mx-auto lg:mx-0" />
          <div className="space-y-2">
            <SkeletonLine width="90%" height="48px" className="mx-auto lg:mx-0" />
            <SkeletonLine width="80%" height="48px" className="mx-auto lg:mx-0" />
          </div>
          <div className="space-y-2 pt-2">
            <SkeletonLine width="95%" height="16px" className="mx-auto lg:mx-0" />
            <SkeletonLine width="75%" height="16px" className="mx-auto lg:mx-0" />
          </div>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
            <SkeletonLine width="140px" height="48px" className="rounded-md" />
            <SkeletonLine width="160px" height="48px" className="rounded-md" />
          </div>
        </div>
        
        {/* Decorative Grid of Floating Visuals */}
        <div className="lg:col-span-6 hidden lg:grid grid-cols-2 gap-4 relative">
          <div className="space-y-4">
            <div className="bg-pure-white border border-ash p-4 rounded-md space-y-2">
              <SkeletonLine width="50%" height="14px" />
              <div className="w-full h-32 skeleton rounded-md" />
              <SkeletonLine width="80%" height="16px" />
            </div>
            <div className="bg-pure-white border border-ash p-4 rounded-md space-y-2">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full skeleton" />
                <SkeletonLine width="80px" height="14px" />
              </div>
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="bg-pure-white border border-ash p-4 rounded-md space-y-2">
              <SkeletonLine width="60%" height="16px" />
              <SkeletonLine width="40%" height="24px" />
            </div>
            <div className="bg-pure-white border border-ash p-4 rounded-md space-y-2">
              <div className="w-full h-36 skeleton rounded-md" />
              <SkeletonLine width="90%" height="16px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// 11. CategoryChipsSkeleton
export const CategoryChipsSkeleton = () => (
  <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <SkeletonLine
        key={i}
        width="110px"
        height="36px"
        className="rounded-3xl shrink-0"
      />
    ))}
  </div>
);
