<template>
    <div class="portfolio min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-rose-200">
        <header
                :class="[
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
                    isScrolled
                        ? 'py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm'
                        : 'py-8 bg-transparent border-b border-transparent'
                ]">
            <nav class="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-4">
                <div class="flex gap-3 sm:gap-8 text-xs sm:text-sm font-medium text-gray-600">
                    <a href="#" class="hover:text-black transition-colors">{{ t.nav.home }}</a>
                    <a href="#services" class="hover:text-black transition-colors">{{ t.nav.services }}</a>
                    <a href="#projects" class="hover:text-black transition-colors">{{ t.nav.projects }}</a>
                    <a href="#capabilities" class="hover:text-black transition-colors">{{ t.nav.capabilities }}</a>
                    <a href="#contact" class="hover:text-black transition-colors">{{ t.nav.contact }}</a>
                </div>

                <!-- Sprachwahl -->
                <div class="flex items-center gap-1 bg-white/90 border border-gray-200 rounded-full p-1 shadow-sm shrink-0">
                    <button v-for="option in languages" :key="option.code"
                            type="button"
                            :aria-pressed="lang === option.code"
                            :aria-label="option.label"
                            @click="setLang(option.code)"
                            :class="[
                                'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer',
                                lang === option.code ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                            ]">
                        <svg v-if="option.code === 'en'" viewBox="0 0 60 30" class="w-5 h-3 rounded-[2px] shrink-0" aria-hidden="true">
                            <clipPath id="flag-gb-clip"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
                            <clipPath id="flag-gb-diag"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
                            <g clip-path="url(#flag-gb-clip)">
                                <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6" />
                                <path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#flag-gb-diag)" stroke="#C8102E" stroke-width="4" />
                                <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10" />
                                <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6" />
                            </g>
                        </svg>
                        <svg v-else viewBox="0 0 5 3" class="w-5 h-3 rounded-[2px] shrink-0" aria-hidden="true">
                            <rect width="5" height="1" y="0" fill="#000" />
                            <rect width="5" height="1" y="1" fill="#DD0000" />
                            <rect width="5" height="1" y="2" fill="#FFCE00" />
                        </svg>
                        <span>{{ option.code.toUpperCase() }}</span>
                    </button>
                </div>
            </nav>
        </header>

        <main>
            <!-- HERO -->
            <section class="max-w-6xl mx-auto px-6 pt-32 pb-24 flex flex-col-reverse md:flex-row items-center gap-16">
                <div class="flex-1 space-y-6">
                    <div
                         class="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span class="text-sm font-medium text-green-800">{{ t.hero.badge }}</span>
                    </div>
                    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight">
                        Okan Akar<br />
                        <span class="text-gray-400">{{ t.hero.role }}</span>
                    </h1>
                    <p class="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
                        {{ t.hero.intro }}
                    </p>
                    <div class="flex gap-4">
                        <a href="#projects"
                           class="border border-black px-6 py-3 rounded-full font-medium hover:bg-black hover:text-white transition-all">
                            {{ t.hero.viewProjects }}
                        </a>
                        <a href="#contact"
                           class="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-all">
                            {{ t.hero.getInTouch }}
                        </a>
                    </div>
                </div>
                <div class="w-64 h-64 md:w-96 md:h-96 shrink-0 rounded-3xl shadow-xl rotate-2 overflow-hidden">
                    <img src="/main/src/frontend/assets/img/portfolio/okan.jpg" alt="Okan Akar"
                         class="object-cover w-full h-full" />
                </div>
            </section>

            <!-- SERVICES -->
            <section id="services" class="max-w-6xl mx-auto px-6 py-20 space-y-12">
                <h2 class="text-4xl font-bold tracking-tight">{{ t.nav.services }}</h2>
                <div class="space-y-10">
                    <div v-for="service in t.services" :key="service.title"
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
                <h2 class="text-4xl font-bold tracking-tight">{{ t.nav.projects }}</h2>

                <!-- Twin Harbour Ortak Açıklama -->
                <div class="space-y-6">
                    <div>
                        <h3 class="text-3xl md:text-4xl font-bold tracking-tight">Twin Harbour Interactive</h3>
                        <p class="text-gray-500 mt-1">{{ t.twinHarbour.parent }}</p>
                    </div>
                    <p class="text-gray-700 leading-relaxed md:text-lg max-w-4xl">
                        {{ t.twinHarbour.description }}
                    </p>
                </div>

                <!-- Twin Harbour oyun kartları -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <a v-for="game in twinHarbourGames" :key="game.title"
                       :href="game.link" target="_blank" rel="noopener"
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
                    <blockquote v-for="quote in t.testimonial.quotes" :key="quote"
                                class="text-base md:text-lg text-gray-800 leading-relaxed italic">
                        {{ quote }}
                    </blockquote>
                    <div class="pt-3 border-t border-gray-100">
                        <p class="font-semibold text-sm">{{ t.testimonial.source }}</p>
                    </div>
                </div>

                <!-- Diğer projeler -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                    <!-- DST Mod -->
                    <a href="https://steamcommunity.com/sharedfiles/filedetails?id=1293751909" target="_blank"
                       rel="noopener" class="group block">
                        <div class="overflow-hidden bg-gray-100 mb-4 border border-gray-100 rounded-[40px]">
                            <img src="/main/src/frontend/assets/img/portfolio/dst.jpg" alt="Don't Starve Together Mod"
                                 class="w-full h-[280px] object-contain object-center transform group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-lg font-bold tracking-tight">Don't Starve Together: Upgradable Walking Cane
                            </h4>
                            <div class="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                                <span>{{ t.dst.highlight }}</span>
                            </div>
                            <div class="flex flex-wrap gap-4 pt-1">
                                <div v-for="stat in dstStats" :key="stat.key">
                                    <div class="text-base font-bold">{{ formatNumber(stat.value) }}</div>
                                    <div class="text-xs text-gray-500">{{ t.dst[stat.key] }}</div>
                                </div>
                            </div>
                            <p class="text-gray-600 leading-relaxed text-sm pt-1">
                                {{ t.dst.description }}
                            </p>
                            <p class="text-blue-600 font-medium text-xs group-hover:underline">
                                steamcommunity.com
                            </p>
                        </div>
                    </a>

                    <!-- Crashbone -->
                    <a href="https://crashbone.com" target="_blank" rel="noopener" class="group block">
                        <div class="overflow-hidden bg-gray-100 mb-4 border border-gray-100 rounded-[40px]">
                            <img src="/main/src/frontend/assets/img/portfolio/projectvocab-dashboard.png"
                                 alt="crashbone.com"
                                 class="w-full h-[280px] object-cover object-top transform group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-lg font-bold tracking-tight">crashbone.com</h4>
                            <p class="text-gray-600 leading-relaxed text-sm">
                                {{ t.crashbone }}
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
                                {{ t.duru }}
                            </p>
                        </div>
                    </div>

                    <!-- Portable AI Environment -->
                    <div class="group block">
                        <div class="overflow-hidden bg-gray-100 mb-4 border border-gray-100 rounded-[40px]">
                            <img src="/main/src/frontend/assets/img/portfolio/ai-environment.jpg"
                                 :alt="t.aiEnv.title"
                                 class="w-full h-[280px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-lg font-bold tracking-tight">{{ t.aiEnv.title }}</h4>
                            <p class="text-gray-600 leading-relaxed text-sm">
                                {{ t.aiEnv.description }}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CAPABILITIES -->
            <section id="capabilities" class="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-12 gap-16">
                <div class="md:col-span-5 space-y-8">
                    <h2 class="text-4xl font-bold tracking-tight">{{ t.nav.capabilities }}</h2>
                    <p class="text-gray-600 leading-relaxed">
                        {{ t.capabilities.lead }} <strong>Vue, JavaScript, TypeScript</strong>.
                        {{ t.capabilities.rest }}
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
                <h2 class="text-4xl md:text-5xl font-bold tracking-tight">{{ t.contact.title }}</h2>
                <p class="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    {{ t.contact.text }}
                </p>
                <div class="pt-4">
                    <a href="https://linkedin.com/in/okan-akar" target="_blank" rel="noopener"
                       class="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                        </svg>
                        {{ t.contact.button }}
                    </a>
                </div>
            </section>
        </main>

        <footer class="border-t border-gray-200 bg-white">
            <div class="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                <div class="text-gray-500 text-sm">
                    &copy; {{ new Date().getFullYear() }} Okan Akar
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

type Lang = 'en' | 'de';

const LANG_KEY = 'portfolio-lang';
const languages: { code: Lang; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' }
];

const lang = ref<Lang>('en');

const setLang = (code: Lang) => {
    lang.value = code;
    document.documentElement.lang = code;
    try {
        localStorage.setItem(LANG_KEY, code);
    } catch {
        // Speicher nicht verfuegbar (privates Fenster), Auswahl gilt nur fuer diese Sitzung.
    }
};

const isScrolled = ref(false);
const handleScroll = () => {
    isScrolled.value = window.scrollY > 50;
};
onMounted(() => {
    let saved: string | null = null;
    try {
        saved = localStorage.getItem(LANG_KEY);
    } catch {
        saved = null;
    }
    const initial: Lang = saved === 'de' || saved === 'en'
        ? saved
        : navigator.language?.toLowerCase().startsWith('de') ? 'de' : 'en';
    setLang(initial);
    window.addEventListener('scroll', handleScroll);
});
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});

// Inhalte: jede Aussage ist in job-application-system/cv/2-2025/35/data belegt.
// "owned" / "verantwortet" ist verboten (Okan, 08.10.2026). Kein "Featured Mod of the Week":
// erfunden, siehe data/projects/dont-starve-mod.md.
const messages = {
    en: {
        nav: { home: 'Home', services: 'Services', projects: 'Projects', capabilities: 'Capabilities', contact: 'Contact' },
        hero: {
            badge: 'Open to full-time roles in Germany',
            role: 'Software Developer, focus on Frontend',
            intro: 'Software developer with 6+ years of production experience, five of them at Twin Harbour Interactive (Stillfront Group) on three live browser games with 90M+ registered players and 600,000+ daily. Vue and TypeScript every day. Since 2025 I have kept building on every front: my own project attempts, agentic development with Claude Code, browser games in Pixi.js, and my German, now with a completed C1.1 course. Looking for a team in Germany to build the next thing with.',
            viewProjects: 'View Projects',
            getInTouch: 'Get in Touch'
        },
        services: [
            {
                title: 'Software Development',
                description: 'JavaScript, TypeScript, HTML, CSS, SCSS. Primary stack: Vue 2/3 and Nuxt, state with Pinia. Unit tests with Jest. Figma designs into production UI. Agentic workflows with Claude Code: subagent orchestration, MCP integrations, custom skills, multi-model setups across Claude, OpenAI and DeepSeek models.'
            },
            {
                title: 'Live Product Maintenance',
                description: 'Bug fixing, technical debt reduction, performance improvements and ongoing feature development on production sites and games. System design on a shared in-house engine: one codebase serving three titles with three art directions, and three migrations in a 1M+ line codebase while the games stayed live. Daily review and cleanup of vibe-coded projects: restructuring, tests and long-term maintainability.'
            },
            {
                title: 'Browser Game Development',
                description: 'Pixi.js and GSAP. Real-time rendering, sprite systems, animation, and performance optimization for browser-based games.'
            }
        ],
        twinHarbour: {
            parent: 'Part of Stillfront Group',
            description: '5 years of frontend development on browser games serving 90M+ registered players and 600,000+ daily active users. Built three major features (Heroes, Battle Pass, Inventory) with an average 15% revenue impact; Heroes drove a ~50% ARPDAU peak during an event. All features run on the in-house engine shared across the titles. 1,000+ pull requests reviewed, 3 new hires onboarded.'
        },
        testimonial: {
            quotes: [
                'Mr. Akar has solid and broad specialist knowledge in frontend development, which he applied reliably in his daily work. He showed strong analytical skills and was able to work through complex technical challenges in a structured manner.',
                'Even under an increased workload, he remained dependable and focused. He worked independently and in a structured way, while also collaborating constructively within the team.'
            ],
            source: 'Twin Harbour Interactive (Stillfront Group) Reference Letter'
        },
        dst: {
            highlight: 'Most downloaded in its release week',
            visitors: 'visitors',
            subscribers: 'subscribers',
            favorites: 'favorites',
            description: "Lua mod for Don't Starve Together, published on the Steam Workshop."
        },
        crashbone: 'Early-stage solo product. Full ownership from discovery to deployment. UI designed in Figma, built with Nuxt, Pinia, and Core Web Vitals optimization.',
        duru: 'Single Page Application for a local business client. Delivered as a freelance engagement over 2 years, with regular updates, theme changes, and content refreshes.',
        aiEnv: {
            title: 'Portable AI Environment',
            description: 'Declarative, reproducible setup for an agentic coding environment across two machines. Orthogonal tags for user, machine and project, merged into one config; custom skills, third-party tools by reference, secrets kept out.'
        },
        capabilities: {
            lead: 'Mainly working on',
            rest: 'Comfortable across a wide range of technologies:'
        },
        contact: {
            title: "Let's Talk",
            text: 'Open to full-time roles in Germany. The quickest way to reach me is LinkedIn.',
            button: 'Connect on LinkedIn'
        }
    },
    de: {
        nav: { home: 'Start', services: 'Leistungen', projects: 'Projekte', capabilities: 'Kenntnisse', contact: 'Kontakt' },
        hero: {
            badge: 'Offen für Festanstellungen in Deutschland',
            role: 'Softwareentwickler, Schwerpunkt Frontend',
            intro: 'Softwareentwickler mit über 6 Jahren Berufserfahrung, davon fünf bei Twin Harbour Interactive (Stillfront Group) an drei Live-Browserspielen mit über 90 Mio. registrierten Spielern und über 600.000 täglich aktiven Nutzern. Vue und TypeScript jeden Tag. Seit 2025 an allen Fronten weiter: eigene Projektversuche, agentische Entwicklung mit Claude Code, Browserspiele mit Pixi.js und mein Deutsch, inzwischen mit abgeschlossenem C1.1-Intensivkurs. Auf der Suche nach einem Team in Deutschland, mit dem ich das nächste Produkt baue.',
            viewProjects: 'Projekte ansehen',
            getInTouch: 'Kontakt aufnehmen'
        },
        services: [
            {
                title: 'Softwareentwicklung',
                description: 'JavaScript, TypeScript, HTML, CSS, SCSS. Schwerpunkt: Vue 2/3 und Nuxt, State-Management mit Pinia. Unit-Tests mit Jest. Umsetzung von Figma-Entwürfen in produktive Oberflächen. Agentische Workflows mit Claude Code: Orchestrierung von Subagenten, MCP-Integrationen, eigene Skills, Zusammenspiel mehrerer Modelle von Claude, OpenAI und DeepSeek.'
            },
            {
                title: 'Wartung von Live-Produkten',
                description: 'Fehlerbehebung, Abbau technischer Schulden, Performance-Optimierung und laufende Feature-Entwicklung an produktiven Websites und Spielen. Systemdesign auf einer gemeinsamen hauseigenen Engine: eine Codebasis für drei Titel mit drei Art Directions, dazu drei Migrationen in über 1 Mio. Zeilen Code bei laufendem Spielbetrieb. Tägliches Review und Bereinigung von Vibe-Coding-Projekten: Umstrukturierung, Tests und nachhaltige Wartbarkeit.'
            },
            {
                title: 'Entwicklung von Browserspielen',
                description: 'Pixi.js und GSAP. Echtzeit-Rendering, Sprite-Systeme, Animation und Performance-Optimierung für Browserspiele.'
            }
        ],
        twinHarbour: {
            parent: 'Teil der Stillfront Group',
            description: '5 Jahre Frontend-Entwicklung an Browserspielen mit über 90 Mio. registrierten Spielern und über 600.000 täglich aktiven Nutzern. Entwicklung von drei großen Features (Heroes, Battle Pass, Inventory) mit durchschnittlich 15% Umsatzwirkung; Heroes erzielte während eines Events eine ARPDAU-Spitze von ~50%. Alle Features laufen auf der hauseigenen Engine, die alle Titel teilen. Über 1.000 PR-Reviews, Einarbeitung von 3 neuen Mitarbeitern.'
        },
        testimonial: {
            quotes: [
                'Herr Akar verfügt über fundierte und breite Fachkenntnisse in der Frontend-Entwicklung, die er in seiner täglichen Arbeit zuverlässig einsetzte. Er zeigte eine ausgeprägte analytische Stärke und arbeitete sich strukturiert durch komplexe technische Herausforderungen.',
                'Auch bei erhöhtem Arbeitsaufkommen blieb er zuverlässig und konzentriert. Er arbeitete selbstständig und strukturiert und brachte sich zugleich konstruktiv ins Team ein.'
            ],
            source: 'Arbeitszeugnis, Twin Harbour Interactive (Stillfront Group)'
        },
        dst: {
            highlight: 'Meistheruntergeladen in der Veröffentlichungswoche',
            visitors: 'Besucher',
            subscribers: 'Abonnenten',
            favorites: 'Favoriten',
            description: "Lua-Mod für Don't Starve Together, veröffentlicht im Steam Workshop."
        },
        crashbone: 'Frühphasiges Solo-Produkt, von der Idee bis zum Deployment in eigener Hand. UI-Entwurf in Figma, Umsetzung mit Nuxt und Pinia, Optimierung der Core Web Vitals.',
        duru: 'Single Page Application für einen lokalen Geschäftskunden. Freiberuflich über 2 Jahre betreut, mit regelmäßigen Updates, Theme-Wechseln und Inhaltspflege.',
        aiEnv: {
            title: 'Portable KI-Umgebung',
            description: 'Deklaratives, reproduzierbares Setup für eine agentische Entwicklungsumgebung auf zwei Rechnern. Orthogonale Tags für Nutzer, Rechner und Projekt, zusammengeführt zu einer Konfiguration; eigene Skills, Fremdwerkzeuge per Referenz, Secrets außerhalb.'
        },
        capabilities: {
            lead: 'Schwerpunkt:',
            rest: 'Dazu sicher in einer breiten Palette von Technologien:'
        },
        contact: {
            title: 'Lassen Sie uns sprechen',
            text: 'Offen für Festanstellungen in Deutschland. Am schnellsten erreichen Sie mich über LinkedIn.',
            button: 'Auf LinkedIn vernetzen'
        }
    }
};

const t = computed(() => messages[lang.value]);

const formatNumber = (value: number) => value.toLocaleString(lang.value === 'de' ? 'de-DE' : 'en-US');

const dstStats = [
    { key: 'visitors', value: 15871 },
    { key: 'subscribers', value: 5150 },
    { key: 'favorites', value: 204 }
] as const;

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
    'Vue', 'Nuxt', 'React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'SCSS', 'Pinia',
    'Pixi.js', 'GSAP', 'Jest', 'Webpack', 'Docker', 'Jenkins', 'Git', 'Figma', 'Adobe XD',
    'Core Web Vitals', 'Selenium', 'Python', 'LangChain', 'Qdrant',
    'Claude Code', 'MCP', 'Opus', 'Astra', 'Codex'
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
