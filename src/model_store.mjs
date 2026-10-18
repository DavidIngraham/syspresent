/** Static, integrity-checked native neighborhoods. No relationship inference. */
const hex=bytes=>[...new Uint8Array(bytes)].map(value=>value.toString(16).padStart(2,'0')).join('');
async function sha256(bytes){return hex(await globalThis.crypto.subtle.digest('SHA-256',bytes));}
async function unzip(bytes){if(!globalThis.DecompressionStream)throw Error('This browser cannot decompress model shards (DecompressionStream unavailable)');return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());}
async function fetchBytes(path){const response=await fetch(path);if(!response.ok)throw Error(`Model shard unavailable: ${path} (HTTP ${response.status})`);return new Uint8Array(await response.arrayBuffer());}

export class ModelStore {
  constructor(bundle,{fetchBytes:loader=fetchBytes,decompress=unzip,digest=sha256,cacheLimit=8}={}){
    this.bundle=bundle;this.loader=loader;this.decompress=decompress;this.digest=digest;
    if(!Number.isInteger(cacheLimit)||cacheLimit<1||cacheLimit>8)throw Error('Model shard cache limit must be 1–8');
    this.cacheLimit=cacheLimit;this.cache=new Map();this.pending=new Map();this.loaded=new Set();
    this.elements=new Map((bundle.elements??[]).map(e=>[e.id,e]));this.edges=new Map((bundle.relationships??[]).map(e=>[e.id,e]));
    this.unavailable=new Set();
    if(bundle.modelStore&&bundle.modelStore.schemaVersion!=='syspresent.model-shards.v1')throw Error('Unsupported model shard schema');
  }
  async bucketFor(id){return (await this.digest(new TextEncoder().encode(id))).slice(0,2);}
  async loadBucket(bucket){
    if(this.cache.has(bucket)){const value=this.cache.get(bucket);this.cache.delete(bucket);this.cache.set(bucket,value);return value;}
    if(this.pending.has(bucket))return this.pending.get(bucket);
    const entry=this.bundle.modelStore?.shards?.[bucket];if(!entry)return null;
    if(!/^model\/(?:[0-9a-f]{2}|unresolved)\.json\.gz$/.test(entry.path))throw Error('Invalid model shard path');
    const promise=(async()=>{const bytes=await this.loader(entry.path);
      if(bytes.byteLength!==entry.bytes||(await this.digest(bytes))!==entry.sha256)throw Error(`Model shard integrity failure: ${bucket}`);
      const expanded=await this.decompress(bytes),value=JSON.parse(new TextDecoder().decode(expanded));
      if(value.schemaVersion!=='syspresent.model-shards.v1'||(bucket!=='unresolved'&&value.bucket!==bucket))throw Error('Model shard identity mismatch');
      this.cache.set(bucket,value);while(this.cache.size>this.cacheLimit)this.cache.delete(this.cache.keys().next().value);return value;
    })();this.pending.set(bucket,promise);
    try{return await promise;}finally{this.pending.delete(bucket);}
  }
  async ensureNeighborhood(ids){
    if(!this.bundle.modelStore)return {loaded:ids.filter(id=>this.elements.has(id)),unavailable:ids.filter(id=>!this.elements.has(id))};
    const unavailable=[],loaded=[];
    for(const id of new Set(ids)){
      if(this.loaded.has(id)){loaded.push(id);continue;}
      const shard=await this.loadBucket(await this.bucketFor(id)),block=shard?.nodes?.[id];
      if(!block){unavailable.push(id);this.unavailable.add(id);continue;}
      if(block.element?.id!==id||!Array.isArray(block.relationships)||!Array.isArray(block.neighbors))throw Error('Malformed native neighborhood');
      for(const edge of block.relationships)if(edge.source!==id&&edge.target!==id)throw Error('Nonincident relationship in native neighborhood');
      this.elements.set(id,block.element);
      for(const neighbor of block.neighbors){if(neighbor.exported){if(!this.elements.has(neighbor.id))this.elements.set(neighbor.id,{...neighbor,neighborhoodLoaded:false});}else this.unavailable.add(neighbor.id);}
      for(const edge of block.relationships)this.edges.set(edge.id,edge);
      this.loaded.add(id);loaded.push(id);
    }
    this.bundle.elements=[...this.elements.values()];this.bundle.relationships=[...this.edges.values()];
    this.bundle.unavailableTargets=[...this.unavailable];
    return {loaded,unavailable};
  }
  /** Retain index relationships with no exported endpoint without inventing nodes. */
  async unresolvedRelationships(){return (await this.loadBucket('unresolved'))?.relationships??[];}
}
