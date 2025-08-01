import { Eye, Search, Settings, CheckCircle } from "lucide-react"
import type { ReactNode } from "react"

interface ExperienceItem {
  icon: ReactNode
  title: string
  text: string
}

interface ExperienceSectionProps {
  experiences?: ExperienceItem[]
}

export default function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const defaultExperiences: ExperienceItem[] = [
    {
      icon: <Eye className="w-8 h-8" style={{ color: "black" }} />,
      title: "Advanced Eye Exam",
      text: "Get a detailed eye check-up using cutting-edge equipment, free of charge.",
    },
    {
      icon: <Search className="w-8 h-8" style={{ color: "black" }} />,
      title: "Lens Selection",
      text: "Choose from affordable, high-quality Korean lenses or global brands like ZEISS, Nikon, Tokai.",
    },
    {
      icon: <Settings className="w-8 h-8" style={{ color: "black" }} />,
      title: "Precision Lens Crafting",
      text: "Experience fast yet precise lens crafting with high-end machines.",
    },
    {
      icon: <CheckCircle className="w-8 h-8" style={{ color: "black" }} />,
      title: "Perfect Fit Guarantee",
      text: "Enjoy tailored frame adjustments for optimal comfort and vision.",
    },
  ]

  const itemsToShow = experiences || defaultExperiences

  return (
    <section className="space-y-4 max-w-3xl mx-auto mt-12" style={{ backgroundColor: "white" }}>
      <h2 className="text-xl font-semibold text-center" style={{ color: "black" }}>
        What You Will Experience
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {itemsToShow.map((exp, i) => (
          <div
            key={i}
            className="p-4 border rounded-md shadow-sm h-full flex flex-col items-center transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: "white",
              borderColor: "#e5e7eb",
            }}
          >
            <div className="mb-3 flex justify-center">{exp.icon}</div>
            <h3 className="font-medium text-sm mb-2 text-center" style={{ color: "black" }}>
              {exp.title}
            </h3>
            <p className="text-xs text-center" style={{ color: "#374151" }}>
              {exp.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
