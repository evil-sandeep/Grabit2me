'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'


export const HeroHeader = () => {
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav className="fixed top-0 z-50 w-full border-b border-transparent">
                <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-300', isScrolled && 'border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60')}>
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <Link
                                href="/"
                                className="flex items-center space-x-2 font-semibold text-xl transition-opacity hover:opacity-80">
                               <Image src={"/grab.svg"} alt="GrabIt" width={120} height={40} className='h-8 w-auto' />
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                asChild
                                variant="ghost"
                                size="sm">
                                <Link href="https://github.com/Rdrudra99/" target="_blank" rel="noopener noreferrer" className="gap-2">
                                    <Github className="h-4 w-4" />
                                    <span className="hidden sm:inline">GitHub</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}