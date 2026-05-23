import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

type Variant = "large" | "small" | "white" | "icon" | "iconInverted";

const srcByVariant: Record<Variant, string> = {
  large: BRAND.logo.large,
  small: BRAND.logo.small,
  white: BRAND.logo.whiteLarge,
  icon: BRAND.logo.icon,
  iconInverted: BRAND.logo.iconInverted,
};

const sizeByVariant: Record<Variant, { w: number; h: number; className: string }> = {
  large: { w: 280, h: 72, className: "h-10 max-w-full w-auto sm:h-11" },
  small: { w: 200, h: 52, className: "h-8 max-w-full w-auto" },
  white: { w: 280, h: 72, className: "h-8 max-w-[11.5rem] w-auto sm:h-9" },
  icon: { w: 40, h: 40, className: "h-9 w-9 shrink-0" },
  iconInverted: { w: 40, h: 40, className: "h-9 w-9 shrink-0" },
};

export function EmprenorLogo({
  variant = "small",
  href,
  className,
  priority,
}: {
  variant?: Variant;
  href?: string;
  className?: string;
  priority?: boolean;
}) {
  const size = sizeByVariant[variant];
  const img = (
    <Image
      src={srcByVariant[variant]}
      alt={BRAND.name}
      width={size.w}
      height={size.h}
      priority={priority}
      className={cn("object-contain object-left", size.className, className)}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex min-w-0 max-w-full items-center overflow-hidden">
        {img}
      </Link>
    );
  }
  return img;
}
