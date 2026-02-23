import{r as m,j as t}from"./app-CNGjdSTo.js";import{S as v}from"./sweetalert2.esm.all-BrPZ0DEU.js";function w({onSerialsParsed:r,existingSerials:u=[]}){const[b,l]=m.useState(!1),[o,x]=m.useState(""),[e,a]=m.useState([]),[c,n]=m.useState([]),h=s=>{const d=s.split(/[\n,;\t]+/).map(i=>i.trim()).filter(i=>i.length>0),k=d.filter(i=>u.includes(i));n(k);const f=[...new Set(d)].filter(i=>!u.includes(i));a(f)},p=()=>{e.length>0&&(r(e),x(""),a([]),n([]),l(!1))},g=()=>{x(""),a([]),n([]),l(!1)};return b?t.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",children:t.jsxs("div",{className:"w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-zinc-900",children:[t.jsxs("div",{className:"flex items-center justify-between border-b px-4 py-3 dark:border-zinc-700",children:[t.jsx("h3",{className:"text-lg font-semibold text-gray-900 dark:text-white",children:"Bulk Input Serial Number"}),t.jsx("button",{type:"button",onClick:g,className:"text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",children:t.jsx("svg",{className:"h-5 w-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),t.jsxs("div",{className:"p-4",children:[t.jsx("p",{className:"mb-3 text-sm text-gray-600 dark:text-gray-400",children:"Paste atau ketik serial number (pisahkan dengan Enter, koma, atau titik koma):"}),t.jsx("textarea",{value:o,onChange:s=>{x(s.target.value),h(s.target.value)},placeholder:`Contoh:\r
SN001\r
SN002, SN003\r
SN004; SN005`,className:"h-32 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"}),e.length>0&&t.jsxs("div",{className:"mt-3 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20",children:[t.jsxs("p",{className:"mb-2 text-sm font-medium text-green-800 dark:text-green-400",children:["✓ ",e.length," serial number akan ditambahkan:"]}),t.jsxs("div",{className:"flex flex-wrap gap-1.5",children:[e.slice(0,10).map((s,d)=>t.jsx("span",{className:"inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-800 dark:text-green-200",children:s},d)),e.length>10&&t.jsxs("span",{className:"text-xs text-green-600 dark:text-green-400",children:["+",e.length-10," lainnya"]})]})]}),c.length>0&&t.jsxs("div",{className:"mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20",children:[t.jsxs("p",{className:"mb-2 text-sm font-medium text-yellow-800 dark:text-yellow-400",children:["⚠ ",c.length," serial sudah ada (akan dilewati):"]}),t.jsx("div",{className:"flex flex-wrap gap-1.5",children:c.map((s,d)=>t.jsx("span",{className:"inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 line-through dark:bg-yellow-800 dark:text-yellow-200",children:s},d))})]})]}),t.jsxs("div",{className:"flex justify-end gap-3 border-t px-4 py-3 dark:border-zinc-700",children:[t.jsx("button",{type:"button",onClick:g,className:"rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-800",children:"Batal"}),t.jsxs("button",{type:"button",onClick:p,disabled:e.length===0,className:"rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50",children:["Tambahkan ",e.length>0&&`(${e.length})`]})]})]})}):t.jsxs("button",{type:"button",onClick:()=>l(!0),className:"inline-flex items-center gap-1.5 rounded-md border border-dashed border-blue-400 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30",children:[t.jsx("svg",{className:"h-4 w-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})}),"Bulk Input"]})}async function N(r,u){const b={masuk:"Barang Masuk",keluar:"Barang Keluar",kembali:"Barang Kembali"}[u];let l=0;r.items.forEach(e=>{e.serial_numbers?l+=e.serial_numbers.filter(a=>a.trim()).length:e.keluar_info&&(l+=e.keluar_info.filter(a=>a.serial_number.trim()).length)});let o=`
        <div class="text-left space-y-4">
            <div class="grid grid-cols-2 gap-2 text-sm border-b pb-3">
                <div class="text-gray-500">Tanggal</div>
                <div class="font-medium">${r.tanggal}</div>
                ${r.lokasi?`
                    <div class="text-gray-500">Tujuan</div>
                    <div class="font-medium">${r.lokasi}</div>
                `:""}
                ${r.asal_barang?`
                    <div class="text-gray-500">Asal Barang</div>
                    <div class="font-medium">${r.asal_barang}</div>
                `:""}
            </div>
            
            <div class="space-y-3">
                <div class="text-sm font-semibold text-gray-700">
                    ${r.items.length} Jenis Barang • ${l} Unit
                </div>
    `;return r.items.forEach((e,a)=>{const c=e.serial_numbers?.filter(n=>n.trim()).length||e.keluar_info?.filter(n=>n.serial_number.trim()).length||0;o+=`
            <div class="rounded border p-3 text-sm">
                <div class="font-medium text-gray-900">
                    #${a+1}: ${e.merek||""} ${e.model||""}
                </div>
                <div class="text-gray-500 text-xs mt-1">
                    ${e.kategori||""} ${e.jenis_barang?`• ${e.jenis_barang}`:""}
                </div>
                <div class="mt-2 text-xs">
                    <span class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
                        ${c} serial number
                    </span>
                    ${e.rak_nama?`
                        <span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-800 ml-1">
                            Rak: ${e.rak_nama} ${e.rak_baris||""}
                        </span>
                    `:""}
                </div>
            </div>
        `}),o+="</div></div>",(await v.fire({title:`Konfirmasi ${b}`,html:o,icon:"question",showCancelButton:!0,confirmButtonText:"Ya, Simpan",cancelButtonText:"Batal",confirmButtonColor:"#2563eb",cancelButtonColor:"#6b7280",width:"32rem"})).isConfirmed}export{w as B,N as s};
