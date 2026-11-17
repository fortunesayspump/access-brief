import React from 'react';import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';import {render,validate} from '@hyper-elements/react';import {emailClients,renderInEmailClients} from '@hyper-elements/email-clients';import {renderPdf} from '@hyper-elements/react/pdf';import {parseGuide} from './model.js';import {WebGuide,EmailGuide,PrintGuide} from './template.js';
await mkdir('dist/assets',{recursive:true});
const fonts=await Promise.all([400,600].map(async weight=>{const src=`node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-${weight}-normal.woff`;await cp(src,`dist/assets/${weight}.woff`);return {family:'IBM Plex Sans',weight,src:await readFile(src)}}));
await cp('node_modules/@fontsource/ibm-plex-sans/LICENSE','dist/assets/FONT-LICENSE.txt');
const emailPlugin=await emailClients({clients:['gmail','outlook','apple-mail']});
for(const file of process.argv.slice(2).length?process.argv.slice(2):['data/natural-history.json','data/blank.json']){
 const g=parseGuide(JSON.parse(await readFile(file,'utf8'))),dir=`dist/${g.id}`;await mkdir(dir,{recursive:true});
 const trees={web:<WebGuide g={g}/>,email:<EmailGuide g={g}/>,print:<PrintGuide g={g}/>};let diagnostics:any={};
 for(const [name,tree] of Object.entries(trees)){const r=await render(tree);diagnostics[name]=validate(tree,name==='email'?{plugins:[emailPlugin]}:{});let html=r.html;if(name==='web')html=html.replace('</head>',`<link rel="stylesheet" href="../access.css"></head>`).replace(/<body[^>]*>/, '$&<a class="skip-link" href="#guide-content">Skip to access guide</a>').replace('<main ', '<main id="guide-content" tabindex="-1" ').replace('</body>',`<script src="../access.js"></script></body>`);await writeFile(`${dir}/${name}.html`,html);if(name==='email')await writeFile(`${dir}/email.txt`,r.text||'');}
 const clients=await renderInEmailClients(trees.email,{emailClients:['outlook','gmail','apple-mail'],computers:['windows']});await mkdir(dir+'/clients',{recursive:true});for(const p of clients.previews)await writeFile(dir+'/clients/'+p.filename,p.html);
 const pdf=await renderPdf(trees.print,{fonts});await writeFile(`${dir}/large-print.pdf`,pdf.pdf);diagnostics.pdf=pdf.diagnostics;await writeFile(`${dir}/diagnostics.json`,JSON.stringify(diagnostics,null,2));await writeFile(`${dir}/record.json`,JSON.stringify(g,null,2));console.log('Rendered',g.id);
}
for(const f of ['index.html','access.css','access.js'])await cp(`public/${f}`,`dist/${f}`);
