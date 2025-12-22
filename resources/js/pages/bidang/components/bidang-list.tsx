import { useState } from 'react';
import { Pencil, Trash2, Building2, Users, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BidangData } from '../types';

interface Props {
    data: BidangData[];
    onEdit: (bidang: BidangData) => void;
    onDelete: (id: number) => void;
    onAddSub: (parentId: number, parentName: string) => void;
}

export default function BidangList({ data, onEdit, onDelete, onAddSub }: Props) {
    if (data.length === 0) {
        return (
            <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <h3 className="text-lg font-medium text-foreground">Struktur Belum Ada</h3>
                <p className="text-sm text-muted-foreground">Mulai dengan menambahkan Kepala Badan / Unit Utama.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {data.map((bidang) => (
                <BidangItem
                    key={bidang.id}
                    item={bidang}
                    level={0}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddSub={onAddSub}
                />
            ))}
        </div>
    );
}

function BidangItem({ item, level, onEdit, onDelete, onAddSub }: {
    item: BidangData;
    level: number;
    onEdit: (b: BidangData) => void;
    onDelete: (id: number) => void;
    onAddSub: (id: number, name: string) => void;
}) {
    const hasChildren = item.children && item.children.length > 0;
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className={cn(
            "rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all",
            level > 0 ? "mt-2 border-l-4 border-l-primary/20 ml-4 sm:ml-8" : "mb-4 border-l-4 border-l-primary"
        )}>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-3 bg-white dark:bg-zinc-900">
                <div className="flex items-start gap-3 w-full sm:w-auto">

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        disabled={!hasChildren}
                        className={cn(
                            "mt-1 sm:mt-0 p-1 rounded transition-colors",
                            hasChildren ? "hover:bg-muted text-foreground cursor-pointer" : "text-transparent cursor-default"
                        )}
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn("font-semibold", level === 0 ? "text-lg" : "text-base")}>
                                {item.nama_bidang}
                            </span>
                            {item.kode && (
                                <Badge variant="outline" className="font-mono text-xs bg-slate-50 text-slate-600 border-slate-200">
                                    {item.kode}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground gap-3">
                            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                <Users className="h-3 w-3" /> {item.users_count || 0} Pegawai
                            </span>
                            {level === 0 && <span className="text-xs italic text-gray-400">Unit Utama</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-center w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 mt-2 sm:mt-0">
                    
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 border-dashed border-slate-300 text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all mr-2"
                        onClick={() => onAddSub(item.id, item.nama_bidang)}
                    >
                        <Plus className="h-3 w-3" />
                        <span className="">Sub</span>
                    </Button>

                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => onDelete(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="bg-slate-50/50 dark:bg-slate-900/20 p-2 border-t">
                    {item.children?.map((child) => (
                        <BidangItem
                            key={child.id}
                            item={child}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddSub={onAddSub}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
