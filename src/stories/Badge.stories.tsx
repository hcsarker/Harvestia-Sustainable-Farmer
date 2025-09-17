import type { StoryDefault, Story } from "@ladle/react";
import { Badge } from "@/components/ui/badge";

export default {
  title: "UI/Badge",
} satisfies StoryDefault;

export const Variants: Story = () => (
  <div className="p-4 space-x-2">
    <Badge>Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="destructive">Destructive</Badge>
    <Badge variant="outline">Outline</Badge>
  </div>
);
