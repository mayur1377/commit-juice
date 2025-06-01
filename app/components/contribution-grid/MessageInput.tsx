import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GRID_COLS } from "@/app/lib/grid-utils";

interface MessageInputProps {
  message: string;
  offset: number;
  onMessageChange: (message: string) => void;
  onOffsetChange: (offset: number) => void;
}

export function MessageInput({ message, offset, onMessageChange, onOffsetChange }: MessageInputProps) {
  const moveLeft = () => {
    onOffsetChange(Math.max(0, offset - 1));
  };

  const moveRight = () => {
    const textWidth = message.length * 6 - 1;
    onOffsetChange(Math.min(GRID_COLS - textWidth, offset + 1));
  };

  return (
    <div className="flex gap-4">
      <motion.input
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border rounded px-3 py-2 flex-1 text-lg"
        type="text"
        placeholder="Type your message here..."
        value={message}
        maxLength={Math.min(Math.floor(GRID_COLS / 6), Math.floor((GRID_COLS - offset) / 6))}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onMessageChange(e.target.value)}
      />
      <div className="flex gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={moveLeft}
            disabled={offset === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={moveRight}
            disabled={offset >= GRID_COLS - (message.length * 6 - 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}