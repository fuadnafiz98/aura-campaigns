import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

export const SendTestMail = () => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          type="button"
          variant={"outline"}
          className="bg-secondary hover:bg-secondary-foreground/15 cursor-pointer"
        >
          Test Mail
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Input
          className="mb-4 border rounded-md border-accent"
          placeholder="Enter email address"
        />
        <div className="w-full flex flex-row gap-2">
          <Button
            size="sm"
            type="button"
            onClick={() => {
              console.log("Test email sent");
            }}
          >
            Send Test Email
          </Button>
          <Button
            type="button"
            variant={"outline"}
            className="bg-secondary hover:bg-destructive cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
