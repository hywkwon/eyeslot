import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({ 
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'
  
  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex flex-col rounded-lg border-t border-gray-200",
        "bg-gradient-to-b from-gray-50/80 to-gray-100/50",
        "p-4 text-start sm:p-6",
        "hover:from-gray-100/90 hover:to-gray-200/60",
        "max-w-[320px] sm:max-w-[320px]",
        "transition-colors duration-300",
        "text-gray-900 dark:text-gray-900",
        className
      )}
      style={{ backgroundColor: "white", color: "black" }}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={author.avatar} 
            alt={author.name}
            onLoad={() => console.log(`✅ Image loaded: ${author.avatar}`)}
            onError={(e) => {
              console.log(`❌ Image failed to load: ${author.avatar}`);
              console.log('Falling back to AvatarFallback');
            }}
          />
          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-semibold text-lg">
            {author.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-md font-semibold leading-none" style={{ color: "black" }}>
            {author.name}
          </h3>
          <p className="text-sm text-gray-600" style={{ color: "#6b7280" }}>
            {author.handle}
          </p>
        </div>
      </div>
      <p className="sm:text-md mt-4 text-sm text-gray-600" style={{ color: "#6b7280" }}>
        {text}
      </p>
    </Card>
  )
}
