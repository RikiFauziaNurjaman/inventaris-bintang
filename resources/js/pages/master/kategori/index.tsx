import { SimpleMasterDataIndex } from '@/components/simple-master-data-index';
import { PERMISSIONS } from '@/constants/permission';

type Kategori = { id: number; nama: string };
type Props = {
    kategori: {
        data: Kategori[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: { search?: string };
};

export default function Index({ kategori, filters }: Props) {
    return (
        <SimpleMasterDataIndex
            title="Kategori Barang"
            description="Kelola pengelompokan utama inventaris agar pencarian dan pelaporan tetap rapi."
            noun="Kategori"
            routeName="kategori"
            data={kategori}
            search={filters.search}
            placeholder="Contoh: Elektronik"
            permissions={{
                create: PERMISSIONS.CREATE_KATEGORI,
                edit: PERMISSIONS.EDIT_KATEGORI,
                delete: PERMISSIONS.DELETE_KATEGORI,
            }}
        />
    );
}
