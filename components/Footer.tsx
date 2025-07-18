export function Footer() {
  return (
    <footer className="w-full border-t p-4 text-center text-muted-foreground">
      <div className="flex items-center justify-center gap-2 text-xs">
        <span>made by mayur</span>
        <a 
          href="https://x.com/thisismayur1377" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
      </div>
    </footer>
  );
}