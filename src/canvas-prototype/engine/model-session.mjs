/** Keep parsed native models only while a load, current project or preview owns them. */
export function createModelSession(native) {
  let tail=Promise.resolve();
  const owners=new Map();
  const enqueue=work=>{
    const result=tail.then(work);
    tail=result.catch(()=>{});
    return result;
  };
  const release=async hash=>{
    if(owners.has(hash)||native.closed===true)return;
    await native.call('ReleaseModel',{modelHash:hash});
  };
  const engine={
    ready:native.ready,
    get closed(){return native.closed===true;},
    call(method,params={}){
      if(method==='ParseSources')return Promise.reject(Error('ParseSources requires a model lease'));
      return enqueue(()=>native.call(method,params));
    },
    terminate(){native.terminate();}
  };
  function createLease(){
    let closed=false,disposal;
    const held=new Set();
    const drop=async hash=>{
      if(!held.delete(hash))return;
      const remaining=owners.get(hash)-1;
      if(remaining)owners.set(hash,remaining);else owners.delete(hash);
      await release(hash);
    };
    return {
      engine:{
        ready:native.ready,
        call(method,params={}){
          if(closed)return Promise.reject(Error('The native model lease has ended'));
          return enqueue(async()=>{
            const result=await native.call(method,params);
            if(method==='ParseSources'&&result?.modelHash&&!held.has(result.modelHash)){
              held.add(result.modelHash);
              owners.set(result.modelHash,(owners.get(result.modelHash)??0)+1);
            }
            return result;
          });
        }
      },
      retainOnly(hash){
        if(closed)return Promise.reject(Error('The native model lease has ended'));
        return enqueue(async()=>{
          if(!held.has(hash))throw Error('The model lease does not own '+hash);
          for(const other of [...held])if(other!==hash)await drop(other);
        });
      },
      dispose(){
        if(disposal)return disposal;
        closed=true;
        disposal=enqueue(async()=>{for(const hash of [...held])await drop(hash);});
        return disposal;
      }
    };
  }
  return {engine,createLease};
}
