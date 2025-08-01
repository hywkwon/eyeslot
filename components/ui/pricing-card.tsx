"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const pricingCardVariants = cva(
  "relative w-full min-w-56 transform overflow-hidden rounded-lg border shadow-lg transition duration-300",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-white",
        outline: "border-gray-200 bg-white",
        ghost: "border-transparent bg-transparent",
        animated: "border-gray-200 animated-gradient-card",
      },
      size: {
        default: "p-6 lg:p-8",
        sm: "p-4 lg:p-6",
        lg: "p-8 lg:p-10",
      },
      hover: {
        default: "hover:scale-[none] md:hover:scale-105",
        none: "hover:scale-100",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hover: "default",
    },
  },
)

export interface PricingCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pricingCardVariants> {
  heading: string
  description: React.ReactNode
  price?: number
  buttonText?: string
  list?: string[]
  discount?: number
  listHeading?: string
  onButtonClick?: () => void
  image?: React.ReactNode
  children?: React.ReactNode
}

const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  (
    {
      className,
      variant,
      size,
      hover,
      heading,
      description,
      price,
      discount,
      list,
      listHeading,
      buttonText,
      onButtonClick,
      image,
      children,
      ...props
    },
    ref,
  ) => {
    const withDiscount = React.useMemo(() => {
      if (!price) return 0
      return Math.round(price - (price * (discount ?? 100)) / 100)
    }, [price, discount])

    return (
      <div ref={ref} className={cn(pricingCardVariants({ variant, size, hover, className }))} {...props}>
        <div className="flex h-full flex-col justify-between">
          {image && <div className="mb-4 -mx-6 -mt-6 lg:-mx-8 lg:-mt-8">{image}</div>}

          <div className="mb-4">
            <h3 className="mb-2 text-xl font-semibold text-black">{heading}</h3>
            <div className="text-gray-600 text-sm">{description}</div>
          </div>

          {price !== undefined && (
            <div>
              <div className="mb-3 flex space-x-2">
                <span className="text-3xl font-extrabold text-black">${discount ? withDiscount : price}</span>
                {discount && <span className="text-gray-400 line-through">${price}</span>}
              </div>

              {discount && (
                <div className="origin-center-right absolute right-[-50%] top-0 w-full -translate-x-6 translate-y-4 rotate-45 bg-gradient-to-r from-black to-gray-800 text-center text-white">
                  {discount}%
                </div>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    )
  },
)
PricingCard.displayName = "PricingCard"

export { PricingCard, pricingCardVariants }
