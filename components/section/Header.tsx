'use client'
import Link from 'next/link'
import { Github } from 'lucide-react'
import React from 'react'


export const HeroHeader = () => {
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    
    return (
        <header className="fixed top-0 z-50 w-full">
            <nav className={`transition-all duration-300 ${isScrolled ? 'bg-white border-b-3 border-[#1a1a1a] shadow-md' : 'bg-background border-b-3 border-[#1a1a1a]'}`}>
                <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    <div className="flex h-14 sm:h-16 items-center justify-between">
                        <div className="flex items-center">
                            <Link
                                href="/"
                                className="inline-block bg-[#ff6b9d] border-2 sm:border-3 border-[#1a1a1a] px-2 sm:px-3 py-1 sm:py-1.5 -rotate-1 font-black text-base sm:text-lg md:text-xl transition-transform hover:scale-105"
                                style={{ boxShadow: '3px 3px 0px 0px #1a1a1a' }}
                            >
                               grabit2me
                            </Link>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link 
                              href="https://github.com/Rdrudra99/" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="h-9 sm:h-10 px-2 sm:px-4 bg-[#1a1a1a] text-white border-2 sm:border-3 border-[#1a1a1a] font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all duration-150 hover:shadow-md active:shadow-sm"
                              style={{ boxShadow: '3px 3px 0px 0px #1a1a1a' }}
                            >
                              <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span className="hidden xs:inline sm:inline">GitHub</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}