import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Github, Instagram, ArrowRight, FileText, ShieldCheck, GraduationCap, Building2 } from 'lucide-react';

export default function Welcome({ auth }: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <>
            <Head title="Selamat Datang - E-Arsip BKAD" />

            <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50 min-h-screen flex flex-col justify-between selection:bg-red-500 selection:text-white font-sans">

                <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                    <img
                        className="absolute -top-20 left-1/2 -z-10 -translate-x-1/2 opacity-10 dark:opacity-40"
                        src="https://laravel.com/assets/img/welcome/background.svg"
                        alt="Background Pattern"
                    />
                </div>

                <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-xl text-black dark:text-white">
                        <div className="bg-red-600 p-1.5 rounded-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className="tracking-tight">E-ARSIP <span className="text-red-600">BKAD</span></span>
                    </div>
                    <nav className="flex gap-4">
                        {auth.user ? (
                            <Link
                                href={'/dashboard'}
                                className="rounded-md px-4 py-2 text-sm font-medium text-black ring-1 ring-transparent transition hover:bg-gray-100 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:bg-gray-800"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={'/login'}
                                className="rounded-full bg-black text-white px-6 py-2.5 text-sm font-bold transition hover:bg-gray-800 focus:outline-none shadow-lg shadow-black/20"
                            >
                                Masuk Sistem
                            </Link>
                        )}
                    </nav>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
                    <div className="max-w-4xl space-y-8">

                        <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-medium text-gray-600 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300">
                            <span className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Proyek Kerja Praktek (KP)
                            </span>
                            <span className="hidden sm:inline text-gray-300">|</span>
                            <span>Teknik Informatika 2025</span>
                        </div>

                        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                            Digitalisasi Arsip <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-red-600">
                                Bidang Anggaran
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Sistem informasi manajemen surat masuk dan disposisi digital yang dirancang khusus untuk meningkatkan efisiensi administrasi di
                            <strong className="text-gray-900 dark:text-white"> Badan Keuangan Daerah (BKAD)</strong>.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            {auth.user ? (
                                <Link href={'/dashboard'}>
                                    <button className="h-14 px-8 rounded-full bg-black text-white font-bold text-lg hover:bg-gray-900 transition flex items-center gap-3 shadow-xl hover:-translate-y-1 transform duration-200">
                                        Buka Dashboard <ArrowRight className="w-5 h-5" />
                                    </button>
                                </Link>
                            ) : (
                                <Link href={'/login'}>
                                    <button className="h-14 px-8 rounded-full bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition flex items-center gap-3 shadow-xl shadow-red-500/30 hover:-translate-y-1 transform duration-200">
                                        Akses Pegawai <ArrowRight className="w-5 h-5" />
                                    </button>
                                </Link>
                            )}
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-200/60 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/50 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 dark:bg-blue-900/30">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pengembang</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">Peno (Fahmi)</p>
                                    <p className="text-xs text-gray-500">NIM: 221220095</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/50 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800">
                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600 dark:bg-purple-900/30">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dosen Pembimbing</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">Pak Barry</p>
                                    <p className="text-xs text-gray-500">Teknik Informatika</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/50 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800">
                                <div className="bg-green-100 p-2 rounded-lg text-green-600 dark:bg-green-900/30">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mentor Lapangan</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">Bapak Andiansyah</p>
                                    <p className="text-xs text-gray-500">BKAD - Bidang Anggaran</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>

                <footer className="py-8 bg-white border-t border-gray-100 dark:bg-gray-950 dark:border-gray-900">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">

                        <div className="text-center md:text-left">
                            <p className="font-medium text-gray-600 dark:text-gray-400">
                                &copy; 2025 E-Arsip BKAD. Project Kerja Praktek.
                            </p>

                            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                <span className="text-xs text-gray-400">Powered by</span>
                                <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                                    <img src="/apple-touch-icon.png" className="w-6 h-auto" alt="ElHalc8n" />
                                    <span>ElHalc8n</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com/penoFahmi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800"
                            >
                                <Github className="w-4 h-4 text-gray-600 group-hover:text-black dark:text-gray-400 dark:group-hover:text-white" />
                                <span className="font-medium text-gray-600 group-hover:text-black dark:text-gray-400 dark:group-hover:text-white">penoFahmi</span>
                            </a>

                            <a
                                href="https://instagram.com/fahmi.peno"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800"
                            >
                                <Instagram className="w-4 h-4 text-pink-600 group-hover:scale-110 transition-transform" />
                                <span className="font-medium text-gray-600 group-hover:text-black dark:text-gray-400 dark:group-hover:text-white">fahmi.peno</span>
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
