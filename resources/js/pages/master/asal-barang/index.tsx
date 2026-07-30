import { SimpleMasterDataIndex } from '@/components/simple-master-data-index';
import { PERMISSIONS } from '@/constants/permission';

type AsalBarang = { id: number; nama: string };
type Props = {
    asal: {
        data: AsalBarang[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: { search?: string };
};

export default function Index({ asal, filters }: Props) {
    return (
        <SimpleMasterDataIndex
            title="Asal Barang"
            description="Kelola sumber perolehan barang untuk pencatatan inventaris."
            noun="Asal barang"
            routeName="asal-barang"
            data={asal}
            search={filters.search}
            placeholder="Contoh: Pembelian"
            permissions={{
                create: PERMISSIONS.CREATE_ASAL_BARANG,
                edit: PERMISSIONS.EDIT_ASAL_BARANG,
                delete: PERMISSIONS.DELETE_ASAL_BARANG,
            }}
        />
    );
}
