import type { StoryDefault, Story } from "@ladle/react";
import { Button } from "@/components/ui/button";

export default {
  title: "UI/Button",
} satisfies StoryDefault;

export const Primary: Story = () => (
  <div className="p-4 space-x-2">
    <Button>Default</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="destructive">Destructive</Button>
    <Button disabled>Disabled</Button>
  </div>
);

export const Sizes: Story = () => (
  <div className="p-4 space-x-2">
    <Button size="sm">Small</Button>
    <Button>Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon">🙂</Button>
  </div>
);
