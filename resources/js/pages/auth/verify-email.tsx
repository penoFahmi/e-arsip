// Components
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head, usePage } from '@inertiajs/react';
import { Mail, LogOut, ArrowRight } from 'lucide-react'; // Pastikan install lucide-react

export default function VerifyEmail({ status }: { status?: string }) {
    // Mengambil data user yang sedang login untuk menampilkan emailnya
    const { auth } = usePage<any>().props;

    return (
        <AuthLayout
            title="Verifikasi Email Anda"
            description="Langkah terakhir untuk mengamankan akun Anda."
        >
            <Head title="Verifikasi Email" />

            <div className="flex flex-col items-center justify-center space-y-6 text-center">

                {/* Visual Icon - Modal Style */}
                <div className="bg-blue-50 p-4 rounded-full">
                    <Mail className="w-10 h-10 text-blue-600" />
                </div>

                <div className="text-sm text-muted-foreground">
                    Kami telah mengirimkan tautan verifikasi ke:
                    <br />
                    <span className="font-semibold text-foreground text-base">
                        {auth?.user?.email || 'email anda'}
                    </span>
                    <br className="mb-2"/>
                    Silakan cek kotak masuk (inbox) atau folder spam Anda.
                </div>

                {/* Status Sukses Terkirim */}
                {status === 'verification-link-sent' && (
                    <div className="w-full bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm font-medium animate-in fade-in slide-in-from-top-2">
                        Tautan verifikasi baru telah dikirim!
                        <br/>Silakan cek email Anda sekarang.
                    </div>
                )}

                <Form {...send.form()} className="w-full space-y-4">
                    {({ processing }) => (
                        <>
                            <div className="grid gap-3">
                                <Button
                                    disabled={processing}
                                    className="w-full gap-2"
                                >
                                    {processing ? <Spinner /> : <Mail className="w-4 h-4"/>}
                                    Kirim Ulang Verifikasi
                                </Button>

                                <a
                                    href={logout()}
                                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium transition-colors border rounded-md hover:bg-accent hover:text-accent-foreground gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Keluar (Logout)
                                </a>
                            </div>

                            <p className="text-xs text-muted-foreground mt-4">
                                Salah alamat email?{' '}
                                <a href={logout()} className="underline hover:text-foreground">
                                    Login kembali
                                </a>
                            </p>
                        </>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}
