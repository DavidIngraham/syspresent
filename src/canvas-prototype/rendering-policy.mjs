/** Display policy only: this module never changes native view membership. */
export const RENDERING_MODES = Object.freeze([
 {id:'exploratory',label:'Exploratory'},
 {id:'focused',label:'Focused notation'},
]);
export const NOTATION_AUTHORITY = Object.freeze({
 url:'https://www.omg.org/spec/SysML/2.0/Language/PDF',
 document:'formal/2026-03-02',
 sections:['8.2.3.3','8.2.3.4','8.2.3.5','8.2.3.6','8.2.3.7','8.2.3.11','8.2.3.12','8.2.3.13','8.2.3.15','8.2.3.17','8.2.3.18','8.2.3.21','8.2.3.24'],
});
/** Focused rendering removes exploratory context and emphasis, but does not certify
 * the renderer against the complete normative graphical syntax. Native extensions,
 * unsupported symbols and missing details still require explicit disclosure. */
export function renderingPolicy(mode='exploratory') {
 if(!RENDERING_MODES.some(item=>item.id===mode))throw new TypeError('Unknown rendering mode: '+mode);
 const focused=mode==='focused';
 return Object.freeze({mode,contextBudget:focused?0:null,emphasis:!focused,journeys:!focused,manualLayout:!focused,
  notice:focused?'Focused OMG SysML v2 notation subset; exploratory context and dimming are disabled. Full OMG SysML v2 notation compliance is not established. Unsupported notation remains disclosed.':''});
}
/** Use the same native active view. Focused mode removes presentation-only
 * emphasis without editing or silently filtering any modeled relationship. */
export function renderingPreferences(preferences,mode='exploratory') {
 const policy=renderingPolicy(mode);
 return {...preferences,...(policy.contextBudget===0?{contextBudget:0}:{}),emphasis:policy.emphasis?[...(preferences.emphasis??[])]:[]};
}
