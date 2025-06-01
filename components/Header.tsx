import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full border-b p-4 flex justify-between items-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold font-press-start"
      >
        Commit Juice
      </motion.h1>

      {session ? (
        <div className="flex items-center gap-4">
          {/* Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-300 shadow-sm cursor-pointer">
                  <img
                    src={session.user?.image || "/default-avatar.png"}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="object-cover h-full w-full"
                  />
                </div>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2"
              >
                <FiLogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="rounded-full"
          >
            <FaGithub className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </header>
  );
}
