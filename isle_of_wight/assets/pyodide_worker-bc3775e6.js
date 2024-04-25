var oe=Object.create,L=Object.defineProperty,ae=Object.getOwnPropertyDescriptor,ne=Object.getOwnPropertyNames,se=Object.getPrototypeOf,le=Object.prototype.hasOwnProperty,u=(e,t)=>L(e,"name",{value:t,configurable:!0}),ce=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,o)=>(typeof require<"u"?require:t)[o]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw new Error('Dynamic require of "'+e+'" is not supported')}),j=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),de=(e,t,o,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of ne(t))!le.call(e,n)&&n!==o&&L(e,n,{get:()=>t[n],enumerable:!(a=ae(t,n))||a.enumerable});return e},pe=(e,t,o)=>(o=e!=null?oe(se(e)):{},de(t||!e||!e.__esModule?L(o,"default",{value:e,enumerable:!0}):o,e)),ue=j((e,t)=>{(function(o,a){typeof define=="function"&&define.amd?define("stackframe",[],a):typeof e=="object"?t.exports=a():o.StackFrame=a()})(e,function(){function o(f){return!isNaN(parseFloat(f))&&isFinite(f)}u(o,"_isNumber");function a(f){return f.charAt(0).toUpperCase()+f.substring(1)}u(a,"_capitalize");function n(f){return function(){return this[f]}}u(n,"_getter");var i=["isConstructor","isEval","isNative","isToplevel"],r=["columnNumber","lineNumber"],l=["fileName","functionName","source"],s=["args"],p=["evalOrigin"],c=i.concat(r,l,s,p);function d(f){if(f)for(var h=0;h<c.length;h++)f[c[h]]!==void 0&&this["set"+a(c[h])](f[c[h]])}u(d,"StackFrame"),d.prototype={getArgs:function(){return this.args},setArgs:function(f){if(Object.prototype.toString.call(f)!=="[object Array]")throw new TypeError("Args must be an Array");this.args=f},getEvalOrigin:function(){return this.evalOrigin},setEvalOrigin:function(f){if(f instanceof d)this.evalOrigin=f;else if(f instanceof Object)this.evalOrigin=new d(f);else throw new TypeError("Eval Origin must be an Object or StackFrame")},toString:function(){var f=this.getFileName()||"",h=this.getLineNumber()||"",v=this.getColumnNumber()||"",_=this.getFunctionName()||"";return this.getIsEval()?f?"[eval] ("+f+":"+h+":"+v+")":"[eval]:"+h+":"+v:_?_+" ("+f+":"+h+":"+v+")":f+":"+h+":"+v}},d.fromString=u(function(f){var h=f.indexOf("("),v=f.lastIndexOf(")"),_=f.substring(0,h),ee=f.substring(h+1,v).split(","),R=f.substring(v+1);if(R.indexOf("@")===0)var O=/@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(R,""),te=O[1],re=O[2],ie=O[3];return new d({functionName:_,args:ee||void 0,fileName:te,lineNumber:re||void 0,columnNumber:ie||void 0})},"StackFrame$$fromString");for(var m=0;m<i.length;m++)d.prototype["get"+a(i[m])]=n(i[m]),d.prototype["set"+a(i[m])]=function(f){return function(h){this[f]=!!h}}(i[m]);for(var y=0;y<r.length;y++)d.prototype["get"+a(r[y])]=n(r[y]),d.prototype["set"+a(r[y])]=function(f){return function(h){if(!o(h))throw new TypeError(f+" must be a Number");this[f]=Number(h)}}(r[y]);for(var g=0;g<l.length;g++)d.prototype["get"+a(l[g])]=n(l[g]),d.prototype["set"+a(l[g])]=function(f){return function(h){this[f]=String(h)}}(l[g]);return d})}),fe=j((e,t)=>{(function(o,a){typeof define=="function"&&define.amd?define("error-stack-parser",["stackframe"],a):typeof e=="object"?t.exports=a(ue()):o.ErrorStackParser=a(o.StackFrame)})(e,u(function(o){var a=/(^|@)\S+:\d+/,n=/^\s*at .*(\S+:\d+|\(native\))/m,i=/^(eval@)?(\[native code])?$/;return{parse:u(function(r){if(typeof r.stacktrace<"u"||typeof r["opera#sourceloc"]<"u")return this.parseOpera(r);if(r.stack&&r.stack.match(n))return this.parseV8OrIE(r);if(r.stack)return this.parseFFOrSafari(r);throw new Error("Cannot parse given Error object")},"ErrorStackParser$$parse"),extractLocation:u(function(r){if(r.indexOf(":")===-1)return[r];var l=/(.+?)(?::(\d+))?(?::(\d+))?$/,s=l.exec(r.replace(/[()]/g,""));return[s[1],s[2]||void 0,s[3]||void 0]},"ErrorStackParser$$extractLocation"),parseV8OrIE:u(function(r){var l=r.stack.split(`
`).filter(function(s){return!!s.match(n)},this);return l.map(function(s){s.indexOf("(eval ")>-1&&(s=s.replace(/eval code/g,"eval").replace(/(\(eval at [^()]*)|(,.*$)/g,""));var p=s.replace(/^\s+/,"").replace(/\(eval code/g,"(").replace(/^.*?\s+/,""),c=p.match(/ (\(.+\)$)/);p=c?p.replace(c[0],""):p;var d=this.extractLocation(c?c[1]:p),m=c&&p||void 0,y=["eval","<anonymous>"].indexOf(d[0])>-1?void 0:d[0];return new o({functionName:m,fileName:y,lineNumber:d[1],columnNumber:d[2],source:s})},this)},"ErrorStackParser$$parseV8OrIE"),parseFFOrSafari:u(function(r){var l=r.stack.split(`
`).filter(function(s){return!s.match(i)},this);return l.map(function(s){if(s.indexOf(" > eval")>-1&&(s=s.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g,":$1")),s.indexOf("@")===-1&&s.indexOf(":")===-1)return new o({functionName:s});var p=/((.*".+"[^@]*)?[^@]*)(?:@)/,c=s.match(p),d=c&&c[1]?c[1]:void 0,m=this.extractLocation(s.replace(p,""));return new o({functionName:d,fileName:m[0],lineNumber:m[1],columnNumber:m[2],source:s})},this)},"ErrorStackParser$$parseFFOrSafari"),parseOpera:u(function(r){return!r.stacktrace||r.message.indexOf(`
`)>-1&&r.message.split(`
`).length>r.stacktrace.split(`
`).length?this.parseOpera9(r):r.stack?this.parseOpera11(r):this.parseOpera10(r)},"ErrorStackParser$$parseOpera"),parseOpera9:u(function(r){for(var l=/Line (\d+).*script (?:in )?(\S+)/i,s=r.message.split(`
`),p=[],c=2,d=s.length;c<d;c+=2){var m=l.exec(s[c]);m&&p.push(new o({fileName:m[2],lineNumber:m[1],source:s[c]}))}return p},"ErrorStackParser$$parseOpera9"),parseOpera10:u(function(r){for(var l=/Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i,s=r.stacktrace.split(`
`),p=[],c=0,d=s.length;c<d;c+=2){var m=l.exec(s[c]);m&&p.push(new o({functionName:m[3]||void 0,fileName:m[2],lineNumber:m[1],source:s[c]}))}return p},"ErrorStackParser$$parseOpera10"),parseOpera11:u(function(r){var l=r.stack.split(`
`).filter(function(s){return!!s.match(a)&&!s.match(/^Error created at/)},this);return l.map(function(s){var p=s.split("@"),c=this.extractLocation(p.pop()),d=p.shift()||"",m=d.replace(/<anonymous function(: (\w+))?>/,"$2").replace(/\([^)]*\)/g,"")||void 0,y;d.match(/\(([^)]*)\)/)&&(y=d.replace(/^[^(]+\(([^)]*)\)$/,"$1"));var g=y===void 0||y==="[arguments not available]"?void 0:y.split(",");return new o({functionName:m,args:g,fileName:c[0],lineNumber:c[1],columnNumber:c[2],source:s})},this)},"ErrorStackParser$$parseOpera11")}},"ErrorStackParser"))}),me=pe(fe()),w=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string"&&typeof process.browser>"u",x,E,F,$,D;async function I(){if(!w||(x=(await import("./__vite-browser-external-dfc062b5.js")).default,D=await import("./__vite-browser-external-dfc062b5.js"),globalThis.fetch?E=fetch:E=(await import("./fetch-npm-browserify-1ff37dca.js").then(function(i){return i.f})).default,$=(await import("./__vite-browser-external-dfc062b5.js")).default,F=await import("./__vite-browser-external-dfc062b5.js"),N=F.sep,typeof ce<"u"))return;let e=await import("./__vite-browser-external-dfc062b5.js"),t=await import("./__vite-browser-external-dfc062b5.js"),o=await import("./__vite-browser-external-dfc062b5.js"),a=await import("./__vite-browser-external-dfc062b5.js"),n={fs:e,crypto:t,ws:o,child_process:a};globalThis.require=function(i){return n[i]}}u(I,"initNodeModules");function T(e,t){return F.resolve(t||".",e)}u(T,"node_resolvePath");function A(e,t){return t===void 0&&(t=location),new URL(e,t).toString()}u(A,"browser_resolvePath");var P;w?P=T:P=A;var N;w||(N="/");function M(e,t){return e.startsWith("file://")&&(e=e.slice(7)),e.includes("://")?{response:E(e)}:{binary:D.readFile(e).then(o=>new Uint8Array(o.buffer,o.byteOffset,o.byteLength))}}u(M,"node_getBinaryResponse");function U(e,t){let o=new URL(e,location);return{response:fetch(o,t?{integrity:t}:{})}}u(U,"browser_getBinaryResponse");var k;w?k=M:k=U;async function H(e,t){let{response:o,binary:a}=k(e,t);if(a)return a;let n=await o;if(!n.ok)throw new Error(`Failed to load '${e}': request failed.`);return new Uint8Array(await n.arrayBuffer())}u(H,"loadBinaryFile");var b;if(globalThis.document)b=u(async e=>await import(e),"loadScript");else if(globalThis.importScripts)b=u(async e=>{try{globalThis.importScripts(e)}catch(t){if(t instanceof TypeError)await import(e);else throw t}},"loadScript");else if(w)b=C;else throw new Error("Cannot determine runtime environment");async function C(e){e.startsWith("file://")&&(e=e.slice(7)),e.includes("://")?$.runInThisContext(await(await E(e)).text()):await import(x.pathToFileURL(e).href)}u(C,"nodeLoadScript");function q(e){let t=e.FS,o=e.FS.filesystems.MEMFS,a=e.PATH,n={DIR_MODE:16895,FILE_MODE:33279,mount:function(i){if(!i.opts.fileSystemHandle)throw new Error("opts.fileSystemHandle is required");return o.mount.apply(null,arguments)},syncfs:async(i,r,l)=>{try{let s=n.getLocalSet(i),p=await n.getRemoteSet(i),c=r?p:s,d=r?s:p;await n.reconcile(i,c,d),l(null)}catch(s){l(s)}},getLocalSet:i=>{let r=Object.create(null);function l(c){return c!=="."&&c!==".."}u(l,"isRealDir");function s(c){return d=>a.join2(c,d)}u(s,"toAbsolute");let p=t.readdir(i.mountpoint).filter(l).map(s(i.mountpoint));for(;p.length;){let c=p.pop(),d=t.stat(c);t.isDir(d.mode)&&p.push.apply(p,t.readdir(c).filter(l).map(s(c))),r[c]={timestamp:d.mtime,mode:d.mode}}return{type:"local",entries:r}},getRemoteSet:async i=>{let r=Object.create(null),l=await ye(i.opts.fileSystemHandle);for(let[s,p]of l)s!=="."&&(r[a.join2(i.mountpoint,s)]={timestamp:p.kind==="file"?(await p.getFile()).lastModifiedDate:new Date,mode:p.kind==="file"?n.FILE_MODE:n.DIR_MODE});return{type:"remote",entries:r,handles:l}},loadLocalEntry:i=>{let r=t.lookupPath(i).node,l=t.stat(i);if(t.isDir(l.mode))return{timestamp:l.mtime,mode:l.mode};if(t.isFile(l.mode))return r.contents=o.getFileDataAsTypedArray(r),{timestamp:l.mtime,mode:l.mode,contents:r.contents};throw new Error("node type not supported")},storeLocalEntry:(i,r)=>{if(t.isDir(r.mode))t.mkdirTree(i,r.mode);else if(t.isFile(r.mode))t.writeFile(i,r.contents,{canOwn:!0});else throw new Error("node type not supported");t.chmod(i,r.mode),t.utime(i,r.timestamp,r.timestamp)},removeLocalEntry:i=>{var r=t.stat(i);t.isDir(r.mode)?t.rmdir(i):t.isFile(r.mode)&&t.unlink(i)},loadRemoteEntry:async i=>{if(i.kind==="file"){let r=await i.getFile();return{contents:new Uint8Array(await r.arrayBuffer()),mode:n.FILE_MODE,timestamp:r.lastModifiedDate}}else{if(i.kind==="directory")return{mode:n.DIR_MODE,timestamp:new Date};throw new Error("unknown kind: "+i.kind)}},storeRemoteEntry:async(i,r,l)=>{let s=i.get(a.dirname(r)),p=t.isFile(l.mode)?await s.getFileHandle(a.basename(r),{create:!0}):await s.getDirectoryHandle(a.basename(r),{create:!0});if(p.kind==="file"){let c=await p.createWritable();await c.write(l.contents),await c.close()}i.set(r,p)},removeRemoteEntry:async(i,r)=>{await i.get(a.dirname(r)).removeEntry(a.basename(r)),i.delete(r)},reconcile:async(i,r,l)=>{let s=0,p=[];Object.keys(r.entries).forEach(function(m){let y=r.entries[m],g=l.entries[m];(!g||t.isFile(y.mode)&&y.timestamp.getTime()>g.timestamp.getTime())&&(p.push(m),s++)}),p.sort();let c=[];if(Object.keys(l.entries).forEach(function(m){r.entries[m]||(c.push(m),s++)}),c.sort().reverse(),!s)return;let d=r.type==="remote"?r.handles:l.handles;for(let m of p){let y=a.normalize(m.replace(i.mountpoint,"/")).substring(1);if(l.type==="local"){let g=d.get(y),f=await n.loadRemoteEntry(g);n.storeLocalEntry(m,f)}else{let g=n.loadLocalEntry(m);await n.storeRemoteEntry(d,y,g)}}for(let m of c)if(l.type==="local")n.removeLocalEntry(m);else{let y=a.normalize(m.replace(i.mountpoint,"/")).substring(1);await n.removeRemoteEntry(d,y)}}};e.FS.filesystems.NATIVEFS_ASYNC=n}u(q,"initializeNativeFS");var ye=u(async e=>{let t=[];async function o(n){for await(let i of n.values())t.push(i),i.kind==="directory"&&await o(i)}u(o,"collect"),await o(e);let a=new Map;a.set(".",e);for(let n of t){let i=(await e.resolve(n)).join("/");a.set(i,n)}return a},"getFsHandles");function z(){let e={};return e.noImageDecoding=!0,e.noAudioDecoding=!0,e.noWasmDecoding=!1,e.preRun=[],e.quit=(t,o)=>{throw e.exited={status:t,toThrow:o},o},e}u(z,"createModule");function W(e,t){e.preRun.push(function(){let o="/";try{e.FS.mkdirTree(t)}catch(a){console.error(`Error occurred while making a home directory '${t}':`),console.error(a),console.error(`Using '${o}' for a home directory instead`),t=o}e.FS.chdir(t)})}u(W,"createHomeDirectory");function B(e,t){e.preRun.push(function(){Object.assign(e.ENV,t)})}u(B,"setEnvironment");function V(e,t){e.preRun.push(()=>{for(let o of t)e.FS.mkdirTree(o),e.FS.mount(e.FS.filesystems.NODEFS,{root:o},o)})}u(V,"mountLocalDirectories");function G(e,t){let o=H(t);e.preRun.push(()=>{let a=e._py_version_major(),n=e._py_version_minor();e.FS.mkdirTree("/lib"),e.FS.mkdirTree(`/lib/python${a}.${n}/site-packages`),e.addRunDependency("install-stdlib"),o.then(i=>{e.FS.writeFile(`/lib/python${a}${n}.zip`,i)}).catch(i=>{console.error("Error occurred while installing the standard library:"),console.error(i)}).finally(()=>{e.removeRunDependency("install-stdlib")})})}u(G,"installStdlib");function K(e,t){let o;t.stdLibURL!=null?o=t.stdLibURL:o=t.indexURL+"python_stdlib.zip",G(e,o),W(e,t.env.HOME),B(e,t.env),V(e,t._node_mounts),e.preRun.push(()=>q(e))}u(K,"initializeFileSystem");function Y(e,t){let{binary:o,response:a}=k(t+"pyodide.asm.wasm");e.instantiateWasm=function(n,i){return async function(){try{let r;a?r=await WebAssembly.instantiateStreaming(a,n):r=await WebAssembly.instantiate(await o,n);let{instance:l,module:s}=r;typeof WasmOffsetConverter<"u"&&(wasmOffsetConverter=new WasmOffsetConverter(wasmBinary,s)),i(l,s)}catch(r){console.warn("wasm instantiation failed!"),console.warn(r)}}(),{}}}u(Y,"preloadWasm");var S="0.24.1";function J(e,t){return new Proxy(e,{get(o,a){return a==="get"?n=>{let i=o.get(n);return i===void 0&&(i=t.get(n)),i}:a==="has"?n=>o.has(n)||t.has(n):Reflect.get(o,a)}})}u(J,"wrapPythonGlobals");function Q(e,t){e.runPythonInternal_dict=e._pyodide._base.eval_code("{}"),e.importlib=e.runPythonInternal("import importlib; importlib");let o=e.importlib.import_module;e.sys=o("sys"),e.sys.path.insert(0,t.env.HOME),e.os=o("os");let a=e.runPythonInternal("import __main__; __main__.__dict__"),n=e.runPythonInternal("import builtins; builtins.__dict__");e.globals=J(a,n);let i=e._pyodide._importhook;function r(s){"__all__"in s||Object.defineProperty(s,"__all__",{get:()=>l.toPy(Object.getOwnPropertyNames(s).filter(p=>p!=="__all__")),enumerable:!1,configurable:!0})}u(r,"jsFinderHook"),i.register_js_finder.callKwargs({hook:r}),i.register_js_module("js",t.jsglobals);let l=e.makePublicAPI();return i.register_js_module("pyodide_js",l),e.pyodide_py=o("pyodide"),e.pyodide_code=o("pyodide.code"),e.pyodide_ffi=o("pyodide.ffi"),e.package_loader=o("pyodide._package_loader"),e.sitepackages=e.package_loader.SITE_PACKAGES.__str__(),e.dsodir=e.package_loader.DSO_DIR.__str__(),e.defaultLdLibraryPath=[e.dsodir,e.sitepackages],e.os.environ.__setitem__("LD_LIBRARY_PATH",e.defaultLdLibraryPath.join(":")),l.pyodide_py=e.pyodide_py,l.globals=e.globals,l}u(Q,"finalizeBootstrap");function X(){if(typeof __dirname=="string")return __dirname;let e;try{throw new Error}catch(a){e=a}let t=me.default.parse(e)[0].fileName,o=t.lastIndexOf(N);if(o===-1)throw new Error("Could not extract indexURL path from pyodide module location");return t.slice(0,o)}u(X,"calculateIndexURL");async function Z(e={}){await I();let t=e.indexURL||X();t=P(t),t.endsWith("/")||(t+="/"),e.indexURL=t;let o={fullStdLib:!1,jsglobals:globalThis,stdin:globalThis.prompt?globalThis.prompt:void 0,lockFileURL:t+"pyodide-lock.json",args:[],_node_mounts:[],env:{},packageCacheDir:t,packages:[]},a=Object.assign(o,e);if(e.homedir){if(console.warn("The homedir argument to loadPyodide is deprecated. Use 'env: { HOME: value }' instead of 'homedir: value'."),e.env&&e.env.HOME)throw new Error("Set both env.HOME and homedir arguments");a.env.HOME=a.homedir}a.env.HOME||(a.env.HOME="/home/pyodide");let n=z();n.print=a.stdout,n.printErr=a.stderr,n.arguments=a.args;let i={config:a};n.API=i,Y(n,t),K(n,a);let r=new Promise(d=>n.postRun=d),l;if(i.bootstrapFinalizedPromise=new Promise(d=>l=d),n.locateFile=d=>a.indexURL+d,typeof _createPyodideModule!="function"){let d=`${a.indexURL}pyodide.asm.js`;await b(d)}if(await _createPyodideModule(n),await r,n.exited)throw n.exited.toThrow;if(i.version!==S)throw new Error(`Pyodide version does not match: '${S}' <==> '${i.version}'. If you updated the Pyodide version, make sure you also updated the 'indexURL' parameter passed to loadPyodide.`);n.locateFile=d=>{throw new Error("Didn't expect to load any more file_packager files!")};let[s,p]=i.rawRun("import _pyodide_core");s&&n.API.fatal_loading_error(`Failed to import _pyodide_core
`,p);let c=Q(i,a);if(l(),c.version.includes("dev")||i.setCdnUrl(`https://cdn.jsdelivr.net/pyodide/v${c.version}/full/`),await i.packageIndexReady,i._pyodide._importhook.register_module_not_found_hook(i._import_name_to_package_name,i.lockfile_unvendored_stdlibs_and_test),i.lockfile_info.version!==S)throw new Error("Lock file version doesn't match Pyodide version");return i.package_loader.init_loaded_packages(),a.fullStdLib&&await c.loadPackage(i.lockfile_unvendored_stdlibs),i.initializeStreams(a.stdin,a.stdout,a.stderr),c}u(Z,"loadPyodide");async function he(e){self.pyodide=await Z({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"}),await self.pyodide.loadPackage(["micropip"]);const t=self.pyodide.pyimport("micropip");await t.install("lzma"),await t.install("pyodide-http"),await t.install(e+"demoland_engine-0.1.dev1+g9a14337-py3-none-any.whl")}self.onmessage=async e=>{const{id:t,python:o,pathname:a,scenario_json:n,model_identifier:i}=e.data;try{await he(a)}catch(r){console.error(r),self.postMessage({error:r.message})}self.scenario_json=n,self.pyodide.globals.set("DEMOLAND",i);try{await self.pyodide.loadPackagesFromImports(o);const r=await self.pyodide.runPythonAsync(o);self.postMessage({results:r,id:t})}catch(r){self.postMessage({error:r.message,id:t})}};