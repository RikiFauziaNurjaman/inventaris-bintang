import{S as d}from"./sweetalert2.esm.all-BhCIHbut.js";async function m(e,t){const n={masuk:"Barang Masuk",keluar:"Barang Keluar",kembali:"Barang Kembali"}[t];let i=0;e.items.forEach(a=>{a.serial_numbers?i+=a.serial_numbers.filter(s=>s.trim()).length:a.keluar_info&&(i+=a.keluar_info.filter(s=>s.serial_number.trim()).length)});let r=`
        <div class="text-left space-y-4">
            <div class="grid grid-cols-2 gap-2 text-sm border-b pb-3">
                <div class="text-gray-500">Tanggal</div>
                <div class="font-medium">${e.tanggal}</div>
                ${e.lokasi?`
                    <div class="text-gray-500">Tujuan</div>
                    <div class="font-medium">${e.lokasi}</div>
                `:""}
                ${e.asal_barang?`
                    <div class="text-gray-500">Asal Barang</div>
                    <div class="font-medium">${e.asal_barang}</div>
                `:""}
            </div>
            
            <div class="space-y-3">
                <div class="text-sm font-semibold text-gray-700">
                    ${e.items.length} Jenis Barang • ${i} Unit
                </div>
    `;return e.items.forEach((a,s)=>{const o=a.serial_numbers?.filter(l=>l.trim()).length||a.keluar_info?.filter(l=>l.serial_number.trim()).length||0;r+=`
            <div class="rounded border p-3 text-sm">
                <div class="font-medium text-gray-900">
                    #${s+1}: ${a.merek||""} ${a.model||""}
                </div>
                <div class="text-gray-500 text-xs mt-1">
                    ${a.kategori||""} ${a.jenis_barang?`• ${a.jenis_barang}`:""}
                </div>
                <div class="mt-2 text-xs">
                    <span class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
                        ${o} serial number
                    </span>
                    ${a.rak_nama?`
                        <span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-800 ml-1">
                            Rak: ${a.rak_nama} ${a.rak_baris||""}
                        </span>
                    `:""}
                </div>
            </div>
        `}),r+="</div></div>",(await d.fire({title:`Konfirmasi ${n}`,html:r,icon:"question",showCancelButton:!0,confirmButtonText:"Ya, Simpan",cancelButtonText:"Batal",confirmButtonColor:"#2563eb",cancelButtonColor:"#6b7280",width:"32rem"})).isConfirmed}export{m as s};
