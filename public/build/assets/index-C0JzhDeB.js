import{j as a,L as r}from"./app-CNGjdSTo.js";import{P as i,A as n}from"./app-layout-Yr-265i6.js";import{c as l}from"./createLucideIcon-BNUT-dRz.js";/* empty css            */import"./button-BxtkxcwU.js";import"./index-BPuxuOo8.js";import"./index-DMsz7JPz.js";import"./x-B8MTmYU5.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],d=l("RefreshCw",c);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],h=l("RotateCcw",p);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]],u=l("Upload",m);function N({summary:t}){const o=[{title:"Barang Masuk",value:t.barang_masuk,icon:a.jsx(i,{className:"h-6 w-6"}),url:"/laporan/masuk",color:"bg-blue-50 text-blue-600"},{title:"Barang Keluar",value:t.barang_keluar,icon:a.jsx(u,{className:"h-6 w-6"}),url:"/laporan/keluar",color:"bg-green-50 text-green-600"},{title:"Barang Kembali",value:t.barang_kembali,icon:a.jsx(h,{className:"h-6 w-6"}),url:"/laporan/kembali",color:"bg-purple-50 text-purple-600"},{title:"Mutasi Barang",value:t.mutasi_barang,icon:a.jsx(d,{className:"h-6 w-6"}),url:"/laporan/mutasi",color:"bg-orange-50 text-orange-600"}];return a.jsx(n,{children:a.jsx("div",{className:"grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-4",children:o.map((e,s)=>a.jsx(r,{href:e.url,className:`rounded-xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${e.color}`,children:a.jsxs("div",{className:"flex items-center justify-between",children:[a.jsxs("div",{children:[a.jsx("h2",{className:"text-lg font-semibold",children:e.title}),a.jsx("p",{className:"mt-2 text-2xl font-bold",children:e.value}),a.jsx("p",{className:"mt-1 text-sm opacity-70",children:"barang"})]}),a.jsx("div",{className:"bg-opacity-50 rounded-lg bg-white p-3",children:e.icon})]})},s))})})}export{N as default};
