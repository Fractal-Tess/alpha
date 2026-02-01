<script lang="ts">
    import { DarkVeil, Logo } from "@alpha/ui";
    import { Button } from "@alpha/ui/shadcn/button";
    import { MotionFade, MotionSlide, MotionPop } from "@alpha/ui/animations";
    import { 
        FileText, 
        Brain, 
        MessageSquare, 
        Zap, 
        ArrowRight, 
        Sparkles, 
        Layers,
        Upload
    } from "@lucide/svelte";

    // Zen Mode Configuration
    const veilConfig = {
        hueShift: 15,
        speed: 0.2,
        noiseIntensity: 0.1,
        scanlineIntensity: 0.05,
        resolutionScale: 1
    };

    const features = [
        {
            title: "Instant Processing",
            description: "Upload PDFs, DOCX, or text. We extract the knowledge instantly.",
            icon: FileText,
            colSpan: "md:col-span-2",
            delay: 100
        },
        {
            title: "Spaced Repetition",
            description: "Master concepts with our SM-2 algorithm.",
            icon: Brain,
            colSpan: "md:col-span-1",
            delay: 200
        },
        {
            title: "AI Chat",
            description: "Ask questions directly to your documents.",
            icon: MessageSquare,
            colSpan: "md:col-span-1",
            delay: 300
        },
        {
            title: "Smart Summaries",
            description: "Get comprehensive summaries and key takeaways in seconds.",
            icon: Zap,
            colSpan: "md:col-span-2",
            delay: 400
        }
    ];
</script>

<DarkVeil
    class="fixed inset-0 -z-50"
    {...veilConfig}
/>

<nav class="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
    <div class="container mx-auto flex h-16 items-center justify-between px-6">
        <div class="flex items-center gap-3">
            <Logo variant="light" class="h-8 w-8" />
            <span class="text-lg font-bold tracking-tight text-white">Alpha</span>
        </div>
        <div class="flex items-center gap-4">
            <Button variant="ghost" href="/auth" class="text-white/70 hover:text-white hover:bg-white/10">
                Log in
            </Button>
            <Button href="/auth" size="sm" class="bg-white text-black hover:bg-white/90">
                Sign up
            </Button>
        </div>
    </div>
</nav>

<main class="relative flex min-h-screen flex-col items-center justify-center px-6 pt-32 pb-20">
    
    <div class="mx-auto max-w-4xl text-center">
        <MotionFade delay={0}>
            <div class="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
                <Sparkles class="mr-2 h-3 w-3 text-indigo-400" />
                <span>v1.0 Alpha Now Available</span>
            </div>
        </MotionFade>

        <MotionSlide direction="up" delay={100}>
            <h1 class="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl">
                Turn Chaos into <br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    Knowledge.
                </span>
            </h1>
        </MotionSlide>

        <MotionFade delay={300}>
            <p class="mx-auto mb-10 max-w-2xl text-lg text-white/60 md:text-xl">
                Upload documents. Generate flashcards. Master any subject in minutes.
                The AI study companion designed for deep work.
            </p>
        </MotionFade>

        <MotionPop delay={500}>
            <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button 
                    size="lg" 
                    href="/auth" 
                    class="group relative h-12 overflow-hidden rounded-full bg-white px-8 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                >
                    <span class="relative z-10 flex items-center gap-2">
                        Get Started
                        <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </Button>
                
                <Button 
                    variant="outline" 
                    size="lg" 
                    href="#features" 
                    class="h-12 rounded-full border-white/10 bg-transparent px-8 text-base text-white hover:bg-white/5 hover:text-white"
                >
                    How it works
                </Button>
            </div>
        </MotionPop>
    </div>

    <div id="features" class="mt-32 w-full max-w-6xl">
        <MotionFade delay={800}>
            <div class="mb-12 text-center">
                <h2 class="text-3xl font-bold text-white md:text-4xl">Everything you need to learn.</h2>
                <p class="mt-4 text-white/50">Powerful tools to help you understand, memorize, and retain.</p>
            </div>
        </MotionFade>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
            {#each features as feature, i}
                <MotionSlide direction="up" delay={feature.delay + 800} class={feature.colSpan}>
                    <div class="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:bg-white/5">
                        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl transition-all duration-500 group-hover:bg-indigo-500/20"></div>
                        
                        <div class="relative z-10 flex h-full flex-col justify-between">
                            <div>
                                <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                                    <feature.icon class="h-6 w-6" />
                                </div>
                                <h3 class="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                                <p class="text-white/60">{feature.description}</p>
                            </div>
                            
                            {#if feature.title === "Instant Processing"}
                                <div class="mt-8 flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 p-3 text-sm text-white/40">
                                    <Upload class="h-4 w-4" />
                                    <span>biology_notes.pdf</span>
                                    <div class="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></div>
                                </div>
                            {/if}
                        </div>
                    </div>
                </MotionSlide>
            {/each}
        </div>
    </div>

    <footer class="mt-32 text-center text-sm text-white/30">
        <p>&copy; {new Date().getFullYear()} Alpha. All rights reserved.</p>
    </footer>

</main>
