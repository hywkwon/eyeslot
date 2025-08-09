"use client"

import { cn } from "@/lib/utils"
import { TestimonialCard, type TestimonialAuthor } from "@/components/ui/testimonial-card"
import { useState } from "react"

interface TestimonialsSectionProps {
  title: string
  description: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
}

export function TestimonialsSection({ 
  title,
  description,
  testimonials,
  className 
}: TestimonialsSectionProps) {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <section className={cn(
      "bg-white text-black",
      "py-12 sm:py-24 md:py-32 px-0",
      className
    )} style={{ backgroundColor: "white", color: "black" }}>
      <div className="mx-auto flex w-full max-w-none flex-col items-center gap-4 text-center sm:gap-16">
        {/* 제목과 설명이 있을 때만 표시 */}
        {(title || description) && (
          <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
            {title && (
              <h2 className="max-w-[720px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight" style={{ color: "black" }}>
                {title}
              </h2>
            )}
            {description && (
              <p className="text-md max-w-[600px] font-medium text-gray-600 sm:text-xl" style={{ color: "#6b7280" }}>
                {description}
              </p>
            )}
          </div>
        )}

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div 
            className="group flex overflow-hidden p-2 [--gap:1.5rem] [gap:var(--gap)] flex-row [--duration:120s]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <div className={cn(
              "flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]",
              isPaused && "[animation-play-state:paused]"
            )}>
              {[...Array(2)].map((_, setIndex) => (
                testimonials.map((testimonial, i) => (
                  <TestimonialCard 
                    key={`${setIndex}-${i}`}
                    {...testimonial}
                  />
                ))
              ))}
            </div>
            {/* 무한 반복을 위한 복제 세트 */}
            <div className={cn(
              "flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]",
              isPaused && "[animation-play-state:paused]"
            )}>
              {[...Array(2)].map((_, setIndex) => (
                testimonials.map((testimonial, i) => (
                  <TestimonialCard 
                    key={`duplicate-${setIndex}-${i}`}
                    {...testimonial}
                  />
                ))
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
        </div>
      </div>
    </section>
  )
}
