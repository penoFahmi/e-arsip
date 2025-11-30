import { FormEventHandler } from 'react';
import { useForm, Head } from '@inertiajs/react';
// Import route helper dari Wayfinder (pastikan path ini benar sesuai struktur foldermu)
import { update } from '@/routes/setup/email';

export default function ForceChangeEmail() {
    const { data, setData, put, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // PERBAIKAN UTAMA DI SINI:
        // Gunakan update.url() dengan tanda kurung ()
        // Agar menghasilkan string: "/setup-email"
        // JANGAN LUPA tanda kurung-nya!
        put(update.url());
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            <Head title="Setup Email Admin" />

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                <div className="mb-6 text-center border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        Keamanan Akun
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Anda terdeteksi menggunakan <strong>Email Default Sistem</strong>.
                        <br />
                        Demi keamanan, Anda <strong>wajib</strong> mengganti email ke alamat email instansi yang valid sebelum melanjutkan.
                    </p>
                </div>

                <form onSubmit={submit}>
                    {/* Input Email Baru */}
                    <div className="mb-4">
                        <label className="block font-medium text-sm text-gray-700" htmlFor="email">
                            Email Baru (Aktif)
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full p-2 border"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                            placeholder="nama@instansi.go.id"
                        />
                        {errors.email && (
                            <div className="text-red-600 text-sm mt-1">{errors.email}</div>
                        )}
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="mb-4">
                        <label className="block font-medium text-sm text-gray-700" htmlFor="password">
                            Konfirmasi Password Saat Ini
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full p-2 border"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            placeholder="Password login anda"
                        />
                        {errors.password && (
                            <div className="text-red-600 text-sm mt-1">{errors.password}</div>
                        )}
                    </div>

                    <div className="flex items-center justify-end mt-4">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 bg-gray-900 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 disabled:opacity-50 transition"
                            disabled={processing}
                        >
                            {processing ? 'Menyimpan...' : 'Simpan & Verifikasi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
