"use client"

import { ExternalLink } from "lucide-react"
import { PricingCard } from "@/components/ui/pricing-card"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function StoreList() {
  const stores = [
    {
      id: "viewraum",
      name: "Viewraum",
      location: "Seoul",
      address: "B154, 45 Yanghwa-ro, Mapo-gu, Seoul",
      hours: "Daily, 10:30 AM - 9:00 PM",
      naverMapUrl: "https://naver.me/FzSZ0p4u",
      googleMapUrl: "https://maps.app.goo.gl/NSxPdGQ3CuVdxLq16",
      description:
        "A premium eyewear store featuring Korea's top eyewear specialists and opticians with diverse experience.",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <div style={{ backgroundColor: "white" }}>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: "black" }}>
        Our Stores
      </h1>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stores.map((store) => (
          <motion.div key={store.id} variants={itemVariants}>
            <PricingCard
              variant="default"
              hover="default"
              heading={store.name}
              description=""
              image={
                <div
                  className="h-48 flex items-center justify-center"
                  style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
                >
                  <span className="text-lg font-medium" style={{ color: "#64748b" }}>
                    {store.name}
                  </span>
                </div>
              }
              className="h-full"
              style={{
                backgroundColor: "white",
                borderColor: "#e5e7eb",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="font-medium text-xs md:text-sm" style={{ color: "#6b7280" }}>
                    Location
                  </h3>
                  <p className="text-xs md:text-sm" style={{ color: "black" }}>
                    {store.location}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-xs md:text-sm" style={{ color: "#6b7280" }}>
                    Address
                  </h3>
                  <p className="text-xs md:text-sm" style={{ color: "black" }}>
                    {store.address}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-xs md:text-sm" style={{ color: "#6b7280" }}>
                    Hours
                  </h3>
                  <p className="text-xs md:text-sm" style={{ color: "black" }}>
                    {store.hours}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-xs md:text-sm" style={{ color: "#6b7280" }}>
                    Description
                  </h3>
                  <p className="text-xs md:text-sm" style={{ color: "#374151" }}>
                    {store.description}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-1 text-xs rounded-[15px] transition-all duration-200"
                    asChild
                    style={{
                      backgroundColor: "white",
                      color: "black",
                      borderColor: "black",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f3f4f6"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white"
                    }}
                  >
                    <a href={store.naverMapUrl} target="_blank" rel="noopener noreferrer">
                      Naver Maps <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-1 text-xs rounded-[15px] transition-all duration-200"
                    asChild
                    style={{
                      backgroundColor: "white",
                      color: "black",
                      borderColor: "black",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f3f4f6"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white"
                    }}
                  >
                    <a href={store.googleMapUrl} target="_blank" rel="noopener noreferrer">
                      Google Maps <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </PricingCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
