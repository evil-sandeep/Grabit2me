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
            <nav className="fixed z-20 w-full px-2">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-full border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex items-center justify-between gap-6 py-3 lg:py-4">
                        <div className="flex items-center">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                               <Image src={"/grab.svg"} alt="logo" width={100} height={100} className='h-10 w-auto' />
                            </Link>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                asChild
                                variant="default"
                                size="sm"
                                className="gap-2 rounded-full px-3 py-2 ">
                                <Link href="https://github.com/Rdrudra99/" target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4" />
                                    <span className="hidden sm:inline">Support</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}