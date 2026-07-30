import { SimpleMasterDataIndex } from '@/components/simple-master-data-index';
import { PERMISSIONS } from '@/constants/permission';

type Merek = { id: number; nama: string };
type Props = {
    merek: {
        data: Merek[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: { search?: string };
};

export default function Index({ merek, filters }: Props) {
    return (
        <SimpleMasterDataIndex
            title="Merek Barang"
            description="Kelola daftar merek yang digunakan oleh model inventaris."
            noun="Merek"
            routeName="merek"
            data={merek}
            search={filters.search}
            placeholder="Contoh: Lenovo"
            permissions={{
                create: PERMISSIONS.CREATE_MEREK,
                edit: PERMISSIONS.EDIT_MEREK,
                delete: PERMISSIONS.DELETE_MEREK,
            }}
        />
    );
}
