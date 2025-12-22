import { FormEventHandler, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { SuratKeluarData } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    surat: SuratKeluarData | null;
}

export default function SuratKeluarUploadModal({ isOpen, onClose, surat }: Props) {
    // Kita gunakan useForm manual karena ini upload file ke route khusus
    const { data, setData, post, processing, reset, errors } = useForm({
        file_bukti: null as File | null,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!surat || !data.file_bukti) return;

        post(`/surat-keluar/${surat.id}/upload-bukti`, {
            onSuccess: () => {
                reset();
                onClose();
            },
            forceFormData: true,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Upload Bukti Tanda Terima</DialogTitle>
                    <DialogDescription>
                        Foto kertas tanda terima / buku ekspedisi yang sudah diparaf penerima.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4 py-2">

                    {data.file_bukti ? (
                        <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden">
                            <img
                                src={URL.createObjectURL(data.file_bukti)}
                                alt="Preview"
                                className="w-full h-full object-contain"
                            />
                            <button
                                type="button"
                                onClick={() => setData('file_bukti', null)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <div
                                className="aspect-square bg-orange-50 border-2 border-orange-200 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100 active:scale-95 transition-all"
                                onClick={() => cameraInputRef.current?.click()}
                            >
                                <Camera className="h-8 w-8 text-orange-600 mb-2" />
                                <span className="text-xs font-bold text-orange-700">Buka Kamera</span>
                            </div>

                            <div
                                className="aspect-square bg-gray-50 border-2 border-gray-200 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 active:scale-95 transition-all"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImageIcon className="h-8 w-8 text-gray-500 mb-2" />
                                <span className="text-xs font-bold text-gray-600">Pilih Galeri</span>
                            </div>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={cameraInputRef}
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => setData('file_bukti', e.target.files?.[0] || null)}
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setData('file_bukti', e.target.files?.[0] || null)}
                    />

                    {errors.file_bukti && <p className="text-sm text-red-600 text-center">{errors.file_bukti}</p>}

                    <div className="pt-2">
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={!data.file_bukti || processing}>
                            {processing ? 'Mengupload...' : 'Simpan Bukti & Selesai'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
