import{c as o}from"./createLucideIcon-D0EutcNi.js";import{r as t}from"./app-CB9JJP1U.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],i=o("Plus",n);function l(r,u=400){const c=t.useRef(r),e=t.useRef(null);return t.useEffect(()=>{c.current=r},[r]),t.useEffect(()=>()=>{e.current&&clearTimeout(e.current)},[]),t.useCallback((...s)=>{e.current&&clearTimeout(e.current),e.current=setTimeout(()=>c.current(...s),u)},[u])}export{i as P,l as u};
