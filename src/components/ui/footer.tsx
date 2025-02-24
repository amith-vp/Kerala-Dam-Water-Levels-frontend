import * as React from "react"
import { Github } from "lucide-react"

const Footer = () => {
  return (
    <footer className="w-full border-t bg-background/50 backdrop-blur-sm">
      <div className="container flex items-center justify-between px-4 text-sm">
        <p className="text-muted-foreground">
          Created by <a href="https://amithv.xyz" target="_blank" rel="noopener" className="font-medium underline underline-offset-4 hover:text-primary">Amith</a>
          <span className="mx-1">•</span>
          Data from <a href="https://dams.kseb.in/" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4 hover:text-primary">KSEB</a>
        </p>
        <a
          href="https://github.com/amith-vp/Kerala-Dam-Water-Levels"
          target="_blank"
          rel="noopener"
          className="text-muted-foreground hover:text-primary"
        >
          <Github className="h-5 w-5" />
        </a>
      </div>
    </footer>
  )
}

export { Footer }