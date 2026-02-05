import { useEffect } from 'react';

export default function SuratPinjamLegal({ data }: { data: any }) {
    useEffect(() => {
        window.print();
    }, []);
    return (
        <div className="relative">
            {/* Tombol Cetak */}

            {/* Print Styles */}
            <style>
                {`
        @media print {
            @page {
                size: 21cm 33cm; /* Ukuran Legal/F4 */
                margin-top: 3cm;
                margin-left: 4cm;
                margin-right: 3cm;
                margin-bottom: 3cm;
            }

            body {
                font-family: 'Times New Roman', serif;
                font-size: 12pt;
                -webkit-print-color-adjust: exact;
            }

            .print\\:hidden {
                display: none !important;
            }
        }
    `}
            </style>

            <div className="mx-auto w-[793px] p-10 text-justify" style={{ fontFamily: 'Times New Roman', fontSize: '12pt' }}>
                {/* Header dengan Logo dan Info Perusahaan */}
                <div className="mb-2 flex items-start justify-between">
                    {/* Logo */}
                    <div className="w-[80px]">
                        <img src="/images/logo-surat.png" alt="Logo" className="h-auto w-[70px] object-contain" />
                    </div>

                    {/* Informasi Perusahaan */}
                    <div className="flex-1 pl-4 text-left font-serif text-[13px] leading-snug">
                        <h1 className="text-[14pt] font-bold uppercase">CV. BINTANG TEKNOLOGI</h1>
                        <p>Jl.Sukawinatan Lr.Asoka No.5623 Kel.Sukajaya, Kec. Sukarami - Palembang</p>
                        <p>Telp.0811-7817374 Email : admin@bintangsims.com</p>
                        <p>Website : http://www.bintangsims.com</p>
                    </div>
                </div>
                {/* Garis Pemisah */}
                <hr className="my-6 border-black" />
                {/* Judul Surat dan Nomor dengan Garis Bawah */}
                <div className="my-4 text-center">
                    {/* Judul langsung dengan border */}
                    <h2 className="inline-block border-b-2 border-black text-[14pt] leading-none font-bold uppercase">
                        SURAT KETERANGAN PINJAM PRINTER
                    </h2>

                    <br />

                    {/* Nomor langsung dengan border */}
                    <p className="mt-1 inline-block border-black text-[12pt] leading-none">NO: {data?.nomor || '007/SKKP/BINTEK/VIII/2025'}</p>
                </div>
                {/* Item Details */}
                {data.barang.map((item, index) => (
                    <div key={index} className={index > 0 ? 'mt-4' : ''}>
                        {' '}
                        {/* Beri jarak jika bukan item pertama */}
                        <table className="table-fixed text-[13px] leading-relaxed">
                            <tbody>
                                <tr>
                                    <td className="w-[130px] align-top">NAMA</td>
                                    <td className="w-[10px] align-top">:</td>
                                    {/* Tampilkan NAMA item */}
                                    <td>{item.nama || 'PRINTER THERMAL'}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">MERK/TYPE</td>
                                    <td className="align-top">:</td>
                                    {/* Tampilkan MERK/TYPE item */}
                                    <td>{item.merek_type || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">SERIAL NUMBER</td>
                                    <td className="align-top">:</td>
                                    {/* Tampilkan SERIAL NUMBER item */}
                                    <td className="break-words">{item.serial_number || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">KELENGKAPAN</td>
                                    <td className="align-top">:</td>
                                    {/* Tampilkan KELENGKAPAN item */}
                                    <td>{item.kelengkapan || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}
                {/* Transition Text */}
                <div className="mt-4 mb-2">
                    <p>Dengan ini kami pinjamkan barang tersebut kepada :</p>
                </div>
                {/* Borrower Details */}\n
                <div className="mb-4">
                    <table className="table-fixed text-[13px] leading-relaxed">
                        <tbody>
                            <tr>
                                <td className="w-[130px] align-top">NAMA</td>
                                <td className="w-[10px] align-top">:</td>
                                <td>{data?.peminjam?.nama_lokasi || 'RSU SRIWIJAYA PALEMBANG'}</td>
                            </tr>
                            <tr>
                                <td className="align-top">ALAMAT</td>
                                <td className="align-top">:</td>
                                <td>
                                    {data?.peminjam?.alamat_lokasi ||
                                        'JL. JEND. SUDIRMAN KM.4,5 NO.502, ILIR TIMUR I, 20 ILIR D. IV, KEC. ILIR TIM. I, KOTA PALEMBANG'}
                                </td>
                            </tr>
                            <tr>
                                <td className="align-top">PENEMPATAN</td>
                                <td className="align-top">:</td>
                                <td>{data?.peminjam?.penempatan || 'RSU SRIWIJAYA PALEMBANG'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {/* Terms and Conditions */}
                <div className="mb-4">
                    <p>Sehubungan dengan hal tersebut maka pihak peminjam dan pemilik, bersedia mematuhi beberapa ketentuan berikut ini :</p>
                    <ul className="mt-2 ml-6 list-disc space-y-1">
                        <li>Bersedia untuk merawat dan tidak memindah tangankan barang tersebut diatas.</li>
                        <li>
                            Kerusakan akibat bukan pemakaian normal (pecah fisik, terbakar, dll) pihak peminjam bersedia untuk mengganti kerugian.
                        </li>
                        <li>
                            Kerusakan normal ditanggung oleh pihak pemilik barang, dan apabila terjadi kerusakan bersedia untuk memberikan barang
                            pengganti.
                        </li>
                        <li>Printer tersebut hanya digunakan untuk produk yang disupport oleh CV. BINTANG TEKNOLOGI.</li>
                        <li>
                            Surat Keterangan Pinjam Printer ini berlaku selama kerjasama antara CV. BINTANG TEKNOLOGI dan{' '}
                            {data?.peminjam?.nama_lokasi || 'RSU SRIWIJAYA PALEMBANG'}.
                        </li>
                        <li>
                            Demikian Surat Keterangan Pinjam Printer ini kami buat untuk digunakan sebagaimana mestinya, dan surat ini berangkap
                            2(dua) serta mempunyai kekuatan hukum yang sama.
                        </li>
                    </ul>
                </div>
                {/* Date and Signatures */}
                <div className="mt-8 flex justify-between">
                    {/* Pemilik */}
                    <div className="text-center">
                        <p>
                            Palembang,{' '}
                            {new Date(data?.tanggal_pinjam || '2025-07-28').toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                        <p className="mt-4">Pihak Pemilik Barang</p>
                        <div className="mt-20">
                            <div className="mx-auto w-48 border-t border-black" />
                            <p className="mt-1">CV. BINTANG TEKNOLOGI</p>
                        </div>
                    </div>
                    {/* Peminjam */}
                    <div className="text-center">
                        <div className="h-6" />
                        <p className="mt-4">Pihak Peminjam</p>

                        <div className="mt-20">
                            <div className="mx-auto inline-block max-w-[250px] text-center break-words">
                                <div className="mb-1 w-full border-t border-black" />
                                <p className="text-center">{data?.peminjam?.nama_lokasi || 'RSU SRIWIJAYA PALEMBANG'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className="mt-16 border-t pt-2 text-center text-xs uppercase">
                    <p className="font-bold">SPECIALIST IDENTITY OF PATIENTS & PVC CARD PRINTING</p>
                    <p>
                        *** Hospital / Patient Card, Patient Wristband, Labels Stiker & Ribbons, Thermal Desktop Printer (Label & ID), SIMRS etc ***
                    </p>
                    <p>*** Member Card, Discount Card, ID Card, Gift Card, Keycard Room, Parking Card, Student Card etc ***</p>
                </div>
            </div>
        </div>
    );
}
