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

export function TestimonialsSection({ title, description, testimonials, className }: TestimonialsSectionProps) {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <section
      className={cn("py-12 sm:py-16 md:py-20 px-0", className)}
      style={{ backgroundColor: "white", color: "black" }}
    >
      <div
        className="mx-auto flex max-w-container flex-col items-center gap-4 text-center sm:gap-8"
        style={{ backgroundColor: "white" }}
      >
        {/* 제목과 설명이 있을 때만 표시 */}
        {(title || description) && (
          <div className="flex flex-col items-center gap-2 px-4 sm:gap-4">
            {title && (
              <h2
                className="max-w-[720px] text-2xl font-semibold leading-tight sm:text-3xl sm:leading-tight"
                style={{ color: "#374151" }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm max-w-[600px] font-medium sm:text-base" style={{ color: "#6b7280" }}>
                {description}
              </p>
            )}
          </div>
        )}

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          {/* PC에서는 전체 너비, 모바일에서는 패딩 적용 */}
          <div
            className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:80s] w-full px-0 sm:px-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <div
              className={cn(
                "flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row min-w-full",
                isPaused && "[animation-play-state:paused]",
              )}
            >
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={`set1-${i}`} {...testimonial} />
              ))}
            </div>
            {/* 무한 스크롤을 위한 복제 */}
            <div
              className={cn(
                "flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row min-w-full",
                isPaused && "[animation-play-state:paused]",
              )}
            >
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={`set2-${i}`} {...testimonial} />
              ))}
            </div>
          </div>

          {/* 그라데이션 오버레이도 반응형으로 조정 */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-1/3 bg-gradient-to-r from-white"
            style={{ background: "linear-gradient(to right, white, transparent)" }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-1/3 bg-gradient-to-l from-white"
            style={{ background: "linear-gradient(to left, white, transparent)" }}
          />
        </div>
      </div>
    </section>
  )
}
