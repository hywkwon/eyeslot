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

export function TestimonialCard({ author, text, href, className }: TestimonialCardProps) {
  const Card = href ? "a" : "div"

  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex flex-col rounded-lg border-t",
        "bg-gradient-to-b from-gray-50 to-gray-25",
        "p-4 text-start sm:p-6",
        "hover:from-gray-100 hover:to-gray-50",
        "max-w-[320px] sm:max-w-[320px]",
        "transition-colors duration-300",
        "border-gray-200",
        className,
      )}
      style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={author.avatar || "/placeholder-user.jpg"} 
            alt={author.name}
            onError={(e) => {
              console.log("Image failed to load:", author.avatar);
              e.currentTarget.style.display = 'none';
            }}
          />
          <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold text-lg">
            {author.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-md font-semibold leading-none text-gray-900">{author.name}</h3>
          <p className="text-sm text-gray-600">{author.handle}</p>
        </div>
      </div>
      <p className="sm:text-md mt-4 text-sm text-gray-700">{text}</p>
    </Card>
  )
}
