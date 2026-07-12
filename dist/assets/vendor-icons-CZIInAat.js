var b={exports:{}},r={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var K;function rt(){if(K)return r;K=1;var f=Symbol.for("react.transitional.element"),a=Symbol.for("react.portal"),l=Symbol.for("react.fragment"),y=Symbol.for("react.strict_mode"),m=Symbol.for("react.profiler"),E=Symbol.for("react.consumer"),M=Symbol.for("react.context"),w=Symbol.for("react.forward_ref"),j=Symbol.for("react.suspense"),R=Symbol.for("react.memo"),T=Symbol.for("react.lazy"),H=Symbol.for("react.activity"),k=Symbol.iterator;function $(t){return t===null||typeof t!="object"?null:(t=k&&t[k]||t["@@iterator"],typeof t=="function"?t:null)}var g={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},A=Object.assign,S={};function h(t,e,o){this.props=t,this.context=e,this.refs=S,this.updater=o||g}h.prototype.isReactComponent={},h.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")},h.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function q(){}q.prototype=h.prototype;function P(t,e,o){this.props=t,this.context=e,this.refs=S,this.updater=o||g}var O=P.prototype=new q;O.constructor=P,A(O,h.prototype),O.isPureReactComponent=!0;var W=Array.isArray;function N(){}var c={H:null,A:null,T:null,S:null},D=Object.prototype.hasOwnProperty;function L(t,e,o){var n=o.ref;return{$$typeof:f,type:t,key:e,ref:n!==void 0?n:null,props:o}}function X(t,e){return L(t.type,e,t.props)}function I(t){return typeof t=="object"&&t!==null&&t.$$typeof===f}function J(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(o){return e[o]})}var z=/\/+/g;function Y(t,e){return typeof t=="object"&&t!==null&&t.key!=null?J(""+t.key):e.toString(36)}function V(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(N,N):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function v(t,e,o,n,u){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var i=!1;if(t===null)i=!0;else switch(s){case"bigint":case"string":case"number":i=!0;break;case"object":switch(t.$$typeof){case f:case a:i=!0;break;case T:return i=t._init,v(i(t._payload),e,o,n,u)}}if(i)return u=u(t),i=n===""?"."+Y(t,0):n,W(u)?(o="",i!=null&&(o=i.replace(z,"$&/")+"/"),v(u,e,o,"",function(et){return et})):u!=null&&(I(u)&&(u=X(u,o+(u.key==null||t&&t.key===u.key?"":(""+u.key).replace(z,"$&/")+"/")+i)),e.push(u)),1;i=0;var _=n===""?".":n+":";if(W(t))for(var p=0;p<t.length;p++)n=t[p],s=_+Y(n,p),i+=v(n,e,o,s,u);else if(p=$(t),typeof p=="function")for(t=p.call(t),p=0;!(n=t.next()).done;)n=n.value,s=_+Y(n,p++),i+=v(n,e,o,s,u);else if(s==="object"){if(typeof t.then=="function")return v(V(t),e,o,n,u);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return i}function x(t,e,o){if(t==null)return t;var n=[],u=0;return v(t,n,"","",function(s){return e.call(o,s,u++)}),n}function F(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(o){(t._status===0||t._status===-1)&&(t._status=1,t._result=o)},function(o){(t._status===0||t._status===-1)&&(t._status=2,t._result=o)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var B=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},tt={map:x,forEach:function(t,e,o){x(t,function(){e.apply(this,arguments)},o)},count:function(t){var e=0;return x(t,function(){e++}),e},toArray:function(t){return x(t,function(e){return e})||[]},only:function(t){if(!I(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};return r.Activity=H,r.Children=tt,r.Component=h,r.Fragment=l,r.Profiler=m,r.PureComponent=P,r.StrictMode=y,r.Suspense=j,r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=c,r.__COMPILER_RUNTIME={__proto__:null,c:function(t){return c.H.useMemoCache(t)}},r.cache=function(t){return function(){return t.apply(null,arguments)}},r.cacheSignal=function(){return null},r.cloneElement=function(t,e,o){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var n=A({},t.props),u=t.key;if(e!=null)for(s in e.key!==void 0&&(u=""+e.key),e)!D.call(e,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&e.ref===void 0||(n[s]=e[s]);var s=arguments.length-2;if(s===1)n.children=o;else if(1<s){for(var i=Array(s),_=0;_<s;_++)i[_]=arguments[_+2];n.children=i}return L(t.type,u,n)},r.createContext=function(t){return t={$$typeof:M,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:E,_context:t},t},r.createElement=function(t,e,o){var n,u={},s=null;if(e!=null)for(n in e.key!==void 0&&(s=""+e.key),e)D.call(e,n)&&n!=="key"&&n!=="__self"&&n!=="__source"&&(u[n]=e[n]);var i=arguments.length-2;if(i===1)u.children=o;else if(1<i){for(var _=Array(i),p=0;p<i;p++)_[p]=arguments[p+2];u.children=_}if(t&&t.defaultProps)for(n in i=t.defaultProps,i)u[n]===void 0&&(u[n]=i[n]);return L(t,s,u)},r.createRef=function(){return{current:null}},r.forwardRef=function(t){return{$$typeof:w,render:t}},r.isValidElement=I,r.lazy=function(t){return{$$typeof:T,_payload:{_status:-1,_result:t},_init:F}},r.memo=function(t,e){return{$$typeof:R,type:t,compare:e===void 0?null:e}},r.startTransition=function(t){var e=c.T,o={};c.T=o;try{var n=t(),u=c.S;u!==null&&u(o,n),typeof n=="object"&&n!==null&&typeof n.then=="function"&&n.then(N,B)}catch(s){B(s)}finally{e!==null&&o.types!==null&&(e.types=o.types),c.T=e}},r.unstable_useCacheRefresh=function(){return c.H.useCacheRefresh()},r.use=function(t){return c.H.use(t)},r.useActionState=function(t,e,o){return c.H.useActionState(t,e,o)},r.useCallback=function(t,e){return c.H.useCallback(t,e)},r.useContext=function(t){return c.H.useContext(t)},r.useDebugValue=function(){},r.useDeferredValue=function(t,e){return c.H.useDeferredValue(t,e)},r.useEffect=function(t,e){return c.H.useEffect(t,e)},r.useEffectEvent=function(t){return c.H.useEffectEvent(t)},r.useId=function(){return c.H.useId()},r.useImperativeHandle=function(t,e,o){return c.H.useImperativeHandle(t,e,o)},r.useInsertionEffect=function(t,e){return c.H.useInsertionEffect(t,e)},r.useLayoutEffect=function(t,e){return c.H.useLayoutEffect(t,e)},r.useMemo=function(t,e){return c.H.useMemo(t,e)},r.useOptimistic=function(t,e){return c.H.useOptimistic(t,e)},r.useReducer=function(t,e,o){return c.H.useReducer(t,e,o)},r.useRef=function(t){return c.H.useRef(t)},r.useState=function(t){return c.H.useState(t)},r.useSyncExternalStore=function(t,e,o){return c.H.useSyncExternalStore(t,e,o)},r.useTransition=function(){return c.H.useTransition()},r.version="19.2.7",r}var G;function nt(){return G||(G=1,b.exports=rt()),b.exports}var d=nt();/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=(...f)=>f.filter((a,l,y)=>!!a&&a.trim()!==""&&y.indexOf(a)===l).join(" ").trim();/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ot=f=>f.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ut=f=>f.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,l,y)=>y?y.toUpperCase():l.toLowerCase());/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=f=>{const a=ut(f);return a.charAt(0).toUpperCase()+a.slice(1)};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var U={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const st=f=>{for(const a in f)if(a.startsWith("aria-")||a==="role"||a==="title")return!0;return!1},ct=d.createContext({}),it=()=>d.useContext(ct),ft=d.forwardRef(({color:f,size:a,strokeWidth:l,absoluteStrokeWidth:y,className:m="",children:E,iconNode:M,...w},j)=>{const{size:R=24,strokeWidth:T=2,absoluteStrokeWidth:H=!1,color:k="currentColor",className:$=""}=it()??{},g=y??H?Number(l??T)*24/Number(a??R):l??T;return d.createElement("svg",{ref:j,...U,width:a??R??U.width,height:a??R??U.height,stroke:f??k,strokeWidth:g,className:Q("lucide",$,m),...!E&&!st(w)&&{"aria-hidden":"true"},...w},[...M.map(([A,S])=>d.createElement(A,S)),...Array.isArray(E)?E:[E]])});/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=(f,a)=>{const l=d.forwardRef(({className:y,...m},E)=>d.createElement(ft,{ref:E,iconNode:a,className:Q(`lucide-${ot(Z(f))}`,`lucide-${f}`,y),...m}));return l.displayName=Z(f),l};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const at=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M8 12h8",key:"1wcyev"}],["path",{d:"M12 8v8",key:"napkw2"}]],dt=C("circle-plus",at);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pt=[["path",{d:"M10.82 16.12c1.69.6 3.91.79 5.18.85.55.03 1-.42.97-.97-.06-1.27-.26-3.5-.85-5.18",key:"18lxf1"}],["path",{d:"M11.5 6.5c1.64 0 5-.38 6.71-1.07.52-.2.55-.82.12-1.17A10 10 0 0 0 4.26 18.33c.35.43.96.4 1.17-.12.69-1.71 1.07-5.07 1.07-6.71 1.34.45 3.1.9 4.88.62a.88.88 0 0 0 .73-.74c.3-2.14-.15-3.5-.61-4.88",key:"vtfxrw"}],["path",{d:"M15.62 16.95c.2.85.62 2.76.5 4.28a.77.77 0 0 1-.9.7 16.64 16.64 0 0 1-4.08-1.36",key:"13hl71"}],["path",{d:"M16.13 21.05c1.65.63 3.68.84 4.87.91a.9.9 0 0 0 .96-.96 17.68 17.68 0 0 0-.9-4.87",key:"1sl8oj"}],["path",{d:"M16.94 15.62c.86.2 2.77.62 4.29.5a.77.77 0 0 0 .7-.9 16.64 16.64 0 0 0-1.36-4.08",key:"19c6kt"}],["path",{d:"M17.99 5.52a20.82 20.82 0 0 1 3.15 4.5.8.8 0 0 1-.68 1.13c-2.33.2-5.3-.32-8.27-1.57",key:"85ghs3"}],["path",{d:"M4.93 4.93 3 3a.7.7 0 0 1 0-1",key:"x087yj"}],["path",{d:"M9.58 12.18c1.24 2.98 1.77 5.95 1.57 8.28a.8.8 0 0 1-1.13.68 20.82 20.82 0 0 1-4.5-3.15",key:"11xdqo"}]],ht=C("hop",pt);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lt=[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]],vt=C("log-out",lt);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yt=[["path",{d:"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",key:"1sd12s"}]],Ct=C("message-circle",yt);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t=[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]],mt=C("search",_t);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Et=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],Rt=C("user",Et);export{dt as C,ht as H,vt as L,Ct as M,mt as S,Rt as U,d as a,nt as r};
