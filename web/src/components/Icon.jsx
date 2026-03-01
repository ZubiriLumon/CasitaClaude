import * as icons from 'lucide-react';

// Dynamic icon component — renders any Lucide icon by name
export default function Icon({ name, size = 18, color, style, ...props }) {
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} color={color} style={style} {...props} />;
}
