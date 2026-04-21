<template>
    <div class="portfolio min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-rose-200">
        <header
                :class="[
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
                    isScrolled
                        ? 'py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm'
                        : 'py-8 bg-transparent border-b border-transparent'
                ]">
            <nav class="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center">
                <div class="flex gap-3 sm:gap-8 text-xs sm:text-sm font-medium text-gray-600">
                    <a href="#" class="hover:text-black transition-colors">Home</a>
                    <a href="#services" class="hover:text-black transition-colors">Services</a>
                    <a href="#projects" class="hover:text-black transition-colors">Projects</a>
                    <a href="#capabilities" class="hover:text-black transition-colors">Capabilities</a>
                    <a href="#contact" class="hover:text-black transition-colors">Contact</a>
                </div>
            </nav>
        </header>

        <main>
            <!-- HERO -->
            <section class="max-w-6xl mx-auto px-6 pt-20 pb-24 flex flex-col-reverse md:flex-row items-center gap-16">
                <div class="flex-1 space-y-6">
                    <div
                         class="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span class="text-sm font-medium text-green-800">Available for new projects, April 2026</span>
                    </div>
                    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight">
                        Okan<br />
                        <span class="text-gray-400">Senior Frontend Developer</span><br />
                        <span class="text-gray-600">6+ years of production experience</span>
                    </h1>
                    <p class="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
                        6+ years building production web applications with Vue.
                        Also comfortable with other frameworks like Nuxt, React, Next, and Angular. Shipped
                        revenue-critical
                        features on browser games with 600,000+ daily players at Twin Harbour Interactive, each driving
                        visible revenue uplift. Experienced across the full feature lifecycle: design coordination,
                        implementation, testing, and release. AI-assisted workflow with Claude Code and MCP
                        integrations.
                    </p>
                    <div class="flex gap-4">
                        <a href="#projects"
                           class="border border-black px-6 py-3 rounded-full font-medium hover:bg-black hover:text-white transition-all">
                            View Projects
                        </a>
                        <a href="#contact"
                           class="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-all">
                            Get in Touch
                        </a>
                    </div>
                </div>
                <a href="https://www.youtube.com/watch?v=6aSM9uyd7Q4" target="_blank" rel="noopener"
                   class="group w-64 h-64 md:w-96 md:h-96 shrink-0 relative block rounded-3xl shadow-xl rotate-2 overflow-hidden">
                    <img
                         src="/main/src/frontend/assets/img/portfolio/okan.jpg"
                         alt="Video Introduction"
                         class="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500" />
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg class="w-7 h-7 md:w-8 md:h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <span class="text-white font-semibold text-sm md:text-base">Video Introduction</span>
                    </div>
                </a>
            </section>

            <!-- SERVICES -->
            <section id="services" class="max-w-6xl mx-auto px-6 py-20 space-y-12">
                <h2 class="text-4xl font-bold tracking-tight">Services</h2>
                <div class="space-y-10">
                    <div v-for="service in services" :key="service.title"
                         class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                        <h3 class="md:col-span-4 text-2xl font-bold tracking-tight">
                            {{ service.title }}
                        </h3>
                        <p class="md:col-span-8 text-gray-600 leading-relaxed md:text-lg">
                            {{ service.description }}
                        </p>
                    </div>
                </div>
            </section>

            <!-- PROJECTS -->
            <section id="projects" class="max-w-6xl mx-auto px-6 py-20 space-y-16">
                <h2 class="text-4xl font-bold tracking-tight">Projects</h2>

                <!-- Twin Harbour Ortak Açıklama -->
                <div class="space-y-6">
                    <div>
                        <h3 class="text-3xl md:text-4xl font-bold tracking-tight">Twin Harbour Interactive</h3>
                        <p class="text-gray-500 mt-1">Part of Stillfront Group</p>
                    </div>
                    <p class="text-gray-700 leading-relaxed md:text-lg max-w-4xl">
                        5 years of frontend development on browser games serving 600,000+ daily players across the
                        portfolio. Contributed to core gameplay systems including Heroes, Battle Pass, and Inventory,
                        each driving visible revenue uplift. All features were built on the in-house game engine
                        shared across titles, allowing gameplay systems to be deployed across multiple games. Worked
                        on feature development from design to production, plus ongoing live product maintenance.
                    </p>
                </div>

                <!-- Twin Harbour oyun kartları -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <a v-for="game in twinHarbourGames" :key="game.title"
                       :href="game.link" target="_blank"
                       class="group block">
                        <div class="overflow-hidden bg-gray-100 mb-4 border border-gray-100 rounded-[40px]">
                            <img :src="game.image" :alt="game.title"
                                 class="w-full h-[280px] object-cover object-top transform group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <h4 class="text-lg font-bold tracking-tight">{{ game.title }}</h4>
                        <p class="text-blue-600 font-medium text-xs group-hover:underline">
                            {{ game.link.replace('https://', '') }}
                        </p>
                    </a>
                </div>

                <!-- TESTIMONIAL -->
                <div class="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 space-y-4 max-w-4xl">
                    <div class="text-4xl text-gray-300 leading-none">"</div>
                    <blockquote class="text-base md:text-lg text-gray-800 leading-relaxed italic">
                        Mr. Akar has solid and broad specialist knowledge in frontend development, which he applied
                        reliably in his daily work. He showed strong analytical skills and was able to work through
                        complex technical challenges in a structured manner.
                    </blockquote>
                    <blockquote class="text-base md:text-lg text-gray-800 leading-relaxed italic">
                        Even under an increased workload, he remained dependable and focused. He worked independently
                        and in a structured way, while also collaborating constructively within the team.
                    </blockquote>
                    <div class="pt-3 border-t border-gray-100">
                        <p class="font-semibold text-sm">Twin Harbour Interactive (Stillfront Group) Reference Letter
                        </p>
                    </div>
                </div>

                <!-- Diğer projeler -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                    <!-- DST Mod -->
                    <a href="https://steamcommunity.com/sharedfiles/filedetails?id=1293751909" target="_blank"
                       class="group block">
                        <div class="overflow-hidden bg-gray-100 mb-4 border border-gray-100 rounded-[40px]">
                            <img src="/main/src/frontend/assets/img/portfolio/dst.jpg" alt="Don't Starve Together Mod"
                                 class="w-full h-[280px] object-contain object-center transform group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-lg font-bold tracking-tight">Don't Starve Together: Upgradable Walking Cane
                            </h4>
                            <div class="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                                <span>🏆</span>
                                <span>Featured Mod of the Week</span>
                            </div>
                            <div class="flex flex-wrap gap-4 pt-1">
                                <div>
                                    <div class="text-base font-bold">15,871</div>
                                    <div class="text-xs text-gray-500">visitors</div>
                                </div>
                                <div>
                                    <div class="text-base font-bold">5,150</div>
                                    <div class="text-xs text-gray-500">subscribers</div>
                                </div>
                                <div>
                                    <div class="text-base font-bold">204</div>
                                    <div class="text-xs text-gray-500">favorites</div>
                                </div>
                            </div>
                            <p class="text-gray-600 leading-relaxed text-sm pt-1">
                                Lua mod for Don't Starve Together, published on the Steam Workshop.
                            </p>
                            <p class="text-blue-600 font-medium text-xs group-hover:underline">
                                steamcommunity.com
                            </p>
                        </div>
                    </a>

                    <!-- Crashbone -->
                    <a href="https://crashbone.com" target="_blank" class="group block">
                        <div class="overflow-hidden bg-gray-100 mb-4 border border-gray-100 rounded-[40px]">
                            <img src="/main/src/frontend/assets/img/portfolio/projectvocab-dashboard.png"
                                 alt="crashbone.com"
                                 class="w-full h-[280px] object-cover object-top transform group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-lg font-bold tracking-tight">crashbone.com</h4>
                            <p class="text-gray-600 leading-relaxed text-sm">
                                Early-stage solo product. Full ownership from discovery to deployment. UI designed in
                                Figma, built with Nuxt, Pinia, and Core Web Vitals optimization.
                            </p>
                            <p class="text-blue-600 font-medium text-xs group-hover:underline">
                                crashbone.com
                            </p>
                        </div>
                    </a>

                    <!-- Mugla Duru Vidanjor -->
                    <div class="group block">
                        <div class="overflow-hidden bg-gray-100 mb-4 border border-gray-100 rounded-[40px]">
                            <img src="/main/src/frontend/assets/img/portfolio/duruvidanjor.jpg"
                                 alt="mugladuruvidanjor.com"
                                 class="w-full h-[280px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-lg font-bold tracking-tight">mugladuruvidanjor.com</h4>
                            <p class="text-gray-600 leading-relaxed text-sm">
                                Single Page Application for a local business client. Delivered as a freelance
                                engagement over 2 years, with regular updates, theme changes, and content refreshes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CAPABILITIES -->
            <section id="capabilities" class="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-12 gap-16">
                <div class="md:col-span-5 space-y-8">
                    <h2 class="text-4xl font-bold tracking-tight">Capabilities</h2>
                    <p class="text-gray-600 leading-relaxed">
                        Mainly working on <strong>Vue, JavaScript, TypeScript</strong>. But comfortably work with a
                        large
                        variety of technologies and principles:
                    </p>
                </div>
                <div class="md:col-span-7 space-y-6">
                    <div class="flex flex-wrap gap-3">
                        <span v-for="skill in skills" :key="skill"
                              class="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                            {{ skill }}
                        </span>
                    </div>
                </div>
            </section>

            <!-- CTA -->
            <section id="contact" class="max-w-4xl mx-auto px-6 py-32 text-center space-y-8">
                <h2 class="text-4xl md:text-5xl font-bold tracking-tight">Let's Work Together</h2>
                <p class="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    Currently available for new projects. Whether you have a detailed spec or just an idea, I am
                    happy to help shape it.
                </p>
                <div class="pt-4">
                    <a href="https://www.upwork.com/freelancers/~017f23b36cea917748" target="_blank"
                       class="inline-block bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all">
                        Contact on Upwork
                    </a>
                </div>
            </section>
        </main>

        <footer class="border-t border-gray-200 bg-white">
            <div class="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                <div class="text-gray-500 text-sm">
                    &copy; {{ new Date().getFullYear() }} Okan.
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const isScrolled = ref(false);
const handleScroll = () => {
    isScrolled.value = window.scrollY > 50;
};
onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});

const services = [
    {
        title: 'Frontend Development',
        description: 'JavaScript, TypeScript, HTML, CSS, SCSS, Tailwind. Primary stack: Vue. Also comfortable with other frameworks like Nuxt, React, Next, and Angular. State management with Pinia, Zustand, Redux. Figma and Adobe XD to code implementation.'
    },
    {
        title: 'Live Product Maintenance',
        description: 'Bug fixing, technical debt reduction, performance improvements, and ongoing feature development on existing production sites and games.'
    },
    {
        title: 'Browser Game Development',
        description: 'Primary: Pixi.js. Also comfortable with Phaser. Real-time rendering, sprite systems, animation, and performance optimization for browser-based games.'
    }
];

const twinHarbourGames = [
    {
        title: 'Supremacy 1914',
        image: '/main/src/frontend/assets/img/portfolio/s1914.jpg',
        link: 'https://supremacy1914.com'
    },
    {
        title: 'Call of War 1942',
        image: '/main/src/frontend/assets/img/portfolio/cow.jpg',
        link: 'https://callofwar.com'
    },
    {
        title: 'Iron Order 1919',
        image: '/main/src/frontend/assets/img/portfolio/io.jpg',
        link: 'https://ironorder1919.com'
    }
];

const skills = [
    'Vue', 'Nuxt', 'React', 'Next', 'Angular', 'Tailwind', 'SCSS', 'JavaScript', 'TypeScript',
    'Pinia', 'Zustand', 'Redux', 'Figma', 'Adobe XD', 'Pixel Perfect', 'Pixi.js', 'Phaser',
    'Jest', 'Vitest', 'Playwright', 'GitHub Actions', 'Jenkins', 'Core Web Vitals LCP, CLS, INP', 'Tests Jest, Vitest, Playwright, Selenium'
];
</script>
<style>
body:has(.portfolio) {
    width: 100%;
    padding: unset !important;
}

body:has(.portfolio) * {
    margin: revert-layer;
}

#app:has(.portfolio) {
    height: 100% !important;
}

html:has(.portfolio) {
    scroll-behavior: smooth;
}
</style>