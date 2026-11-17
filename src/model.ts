export type Fact={category:'Arrival'|'Inside'|'Plan ahead';title:string;state:'published'|'unknown';detail:string};
export type Guide={id:string;venue:string;place:string;checked:string;source:string;contact:string;facts:Fact[]};
export function parseGuide(v:any):Guide{
 if(!v||typeof v!=='object'||!Array.isArray(v.facts))throw Error('Expected a guide with facts');
 for(const [key,max] of Object.entries({id:40,venue:80,place:100,checked:10,source:220,contact:35}))if(typeof v[key]!=='string'||v[key].length>max)throw Error(`Invalid ${key}`);
 for(const text of [v.venue,v.place,v.contact,...v.facts.flatMap((f:any)=>[f.title,f.detail])])if(typeof text==='string'&&/\S{25}/.test(text))throw Error('Text contains a word longer than 24 characters; add a break or shorten it');
 if(!/^[a-z0-9-]+$/.test(v.id))throw Error('Invalid id');
 if(v.source && new URL(v.source).protocol!=='https:')throw Error('Source must be HTTPS');
 if(v.checked && (!/^\d{4}-\d{2}-\d{2}$/.test(v.checked)||Number.isNaN(Date.parse(v.checked+'T00:00:00Z'))||new Date(v.checked+'T00:00:00Z').toISOString().slice(0,10)!==v.checked))throw Error('Invalid date');
 if(v.facts.length>12)throw Error('Maximum 12 facts');
 for(const f of v.facts){if(!['Arrival','Inside','Plan ahead'].includes(f.category)||!['published','unknown'].includes(f.state))throw Error('Invalid fact state/category');if(typeof f.title!=='string'||!f.title||f.title.length>60||typeof f.detail!=='string'||!f.detail||f.detail.length>190)throw Error('Invalid fact text');if(f.state==='published'&&(!v.source||!v.checked||!v.venue))throw Error('Published facts require venue, source and date');}
 return v;
}
export const dateLabel=(g:Guide)=>g.checked?new Date(g.checked+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}):'Not reviewed';
export const groups=['Arrival','Inside','Plan ahead'] as const;
