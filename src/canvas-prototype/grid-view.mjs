import {isGridView, representedIdentities} from './view-contract.mjs';

const copy = value => value === undefined ? undefined : structuredClone(value);
const text = value => value === null || value === undefined ? '' : String(value);
const hasIdentity = value => typeof value === 'string' && value.length > 0;
const positionKey = (row,column) => `${row}:${column}`;

/** Sorting is a presentation order over native row indices, never a model edit. */
export function gridRowOrder(view, sort) {
  const indices = (view.rows ?? []).map((_,index) => index);
  if (view.kind === 'matrix' || !sort || !Number.isInteger(sort.column) || sort.column < 0 || sort.column >= (view.columns ?? []).length) return indices;
  const direction = sort.direction === 'descending' ? -1 : 1;
  return indices.sort((a,b) => {
    const left = text(view.rows[a].cells?.[sort.column]),right = text(view.rows[b].cells?.[sort.column]);
    return direction * left.localeCompare(right,undefined,{numeric:true}) || a-b;
  });
}

/**
 * Mount a bounded HTML reading region. Selection never scrolls, sorts or explores.
 * State contains presentation data only and can be saved with navigation history.
 */
export function mountGrid(host, view, options={}) {
  if (!isGridView(view)) throw Error(`Grid renderer cannot render ${view?.kind}`);
  const doc = host.ownerDocument, matrix = view.kind === 'matrix';
  const rows = view.rows ?? [], columns = view.columns ?? [];
  const columnElements = new Map((view.columnElements ?? []).map(item => [item.index,item]));
  const relationships = new Map();
  for (const cell of view.relationshipCells ?? []) {
    const key = positionKey(cell.row,cell.column);
    relationships.set(key,[...(relationships.get(key) ?? []),...copy(cell.relationships ?? [])]);
  }
  const nativeIds = new Set(representedIdentities(view));
  const semanticIdsFor = selection => [...new Set([
    selection?.semanticId,...(selection?.relationships ?? []).map(item => item.semanticId),
  ].filter(hasIdentity))];
  const incoming = copy(options.state ?? {});
  const initialIds = options.selectedIds ?? (hasIdentity(options.selectedId) ? [options.selectedId] : incoming.selectedIds ?? (hasIdentity(incoming.selectedId) ? [incoming.selectedId] : []));
  const sharedSelectionExplicit = Array.isArray(options.selectedIds) || hasIdentity(options.selectedId);
  const initialIdentities = [...new Set(initialIds.filter(hasIdentity))];
  const savedSelectionIdentities = semanticIdsFor(incoming.selection);
  const selectionMatchesShared = initialIdentities.length === savedSelectionIdentities.length && initialIdentities.every(id => savedSelectionIdentities.includes(id));
  let state = {
    scrollTop:Math.max(0,Number(incoming.scrollTop)||0),
    scrollLeft:Math.max(0,Number(incoming.scrollLeft)||0),
    sort:matrix ? null : incoming.sort ?? null,
    widths:{...incoming.widths}, selection:sharedSelectionExplicit && !selectionMatchesShared ? null : incoming.selection ?? null,
    selectedId:initialIdentities.length === 1 ? initialIdentities[0] : null,
    selectedIds:initialIdentities,
  };
  let destroyed = false;
  const listeners = [];
  const listen = (target,event,handler,settings) => {
    target.addEventListener(event,handler,settings);
    listeners.push(() => target.removeEventListener(event,handler,settings));
  };
  const el = (tag,className,content) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = text(content);
    return node;
  };
  const labelFor = id => text(options.labelFor?.(id) || id);
  const button = (label,action,className='') => {
    const result = el('button',className,label); result.type = 'button';
    result.addEventListener('click',event => {event.stopPropagation(); action();});
    return result;
  };
  const shell = el('section','canvas-grid-view');
  shell.setAttribute('aria-label',view.title ?? view.id ?? (matrix ? 'Relationship matrix' : 'Model table'));
  const toolbar = el('div','canvas-grid-toolbar');
  const settings = el('details','canvas-grid-settings');
  settings.append(el('summary',null,'Columns'));
  const widthFields = el('div','canvas-grid-widths');
  settings.append(widthFields); toolbar.append(settings);
  const summary = el('span','canvas-grid-summary',`${rows.length} rows · ${columns.length} columns`);
  toolbar.append(summary);
  const viewport = el('div','canvas-grid-scroll');
  viewport.tabIndex = 0;
  viewport.setAttribute('role','region');
  viewport.setAttribute('aria-label',`${matrix ? 'Matrix' : 'Table'} contents; scroll to read all rows and columns`);
  const table = el('table','canvas-grid-table');
  table.setAttribute('aria-label',view.title ?? view.id ?? 'Native model view');
  const colgroup = el('colgroup'),thead = el('thead'),tbody = el('tbody');
  table.append(colgroup,thead,tbody); viewport.append(table);
  const inspector = el('div','canvas-grid-inspector');
  inspector.setAttribute('role','status'); inspector.setAttribute('aria-live','polite');
  const disclosure = el('p','canvas-grid-disclosure');
  shell.append(toolbar,viewport,inspector,disclosure); host.append(shell);
  const bindings = [];
  const getState = () => copy({...state,scrollTop:viewport.scrollTop,scrollLeft:viewport.scrollLeft});
  const changed = () => { if (!destroyed) options.onStateChange?.(getState()); };
  const samePosition = (a,b) => a && b && a.kind === b.kind && a.row === b.row && a.column === b.column;
  const rowSelection = row => ({
    kind:'row',row,semanticId:rows[row].semanticId,
    label:text(rows[row].cells?.[0] ?? rows[row].name ?? `Row ${row+1}`),
    identityStatus:rows[row].identityStatus ?? (hasIdentity(rows[row].semanticId) ? 'native' : 'unknown'),
  });
  const columnSelection = column => ({
    kind:'column',column,semanticId:columnElements.get(column)?.semanticId,
    label:text(columns[column]),
    identityStatus:columnElements.get(column)?.identityStatus ?? (hasIdentity(columnElements.get(column)?.semanticId) ? 'native' : 'unknown'),
  });
  const cellSelection = (row,column) => {
    const links = copy(relationships.get(positionKey(row,column)) ?? []);
    return {
      kind:matrix ? 'relationship-cell' : 'value-cell',row,column,
      ...(links.length === 1 && hasIdentity(links[0].semanticId) ? {semanticId:links[0].semanticId} : {}),
      label:text(rows[row].cells?.[column]),
      rowSemanticId:rows[row].semanticId,columnSemanticId:columnElements.get(column)?.semanticId,
      relationships:links,
    };
  };
  const bind = (node,selection) => {
    bindings.push({node,selection});
    const id = semanticIdsFor(selection)[0]; if (id) node.dataset.semanticId = id;
    node.dataset.gridKind = selection.kind;
    if (selection.row !== undefined) node.dataset.gridRow = String(selection.row);
    if (selection.column !== undefined) node.dataset.gridColumn = String(selection.column);
    return node;
  };
  const renderInspector = () => {
    inspector.replaceChildren();
    const selection = state.selection;
    if (!selection) {
      inspector.append(el('span',null,'Select a row, heading or cell to inspect it. Explore is a separate action.'));
      return;
    }
    const description = el('div','canvas-grid-selection');
    if (selection.kind === 'relationship-cell') {
      description.append(el('strong',null,`${text(rows[selection.row]?.cells?.[0])} × ${text(columns[selection.column])}`));
      const links = selection.relationships ?? [];
      if (!links.length) {
        description.append(el('p',null,selection.label
          ? 'Relationship provenance is unavailable for this cell. Its displayed value is retained.'
          : 'No matching relationship in this view.'));
        if (selection.label) description.append(el('p',null,selection.label));
      } else {
        description.append(el('p',null,`${links.length} native relationship${links.length === 1 ? '' : 's'}. Direction is shown for each relationship.`));
        const list = el('ul');
        for (const relationship of links) {
          const item = el('li');
          item.append(el('span',null,`${relationship.kind ?? 'Relationship'}: ${hasIdentity(relationship.sourceSemanticId) ? labelFor(relationship.sourceSemanticId) : 'Unknown source identity'} → ${hasIdentity(relationship.targetSemanticId) ? labelFor(relationship.targetSemanticId) : 'Unknown target identity'}${relationship.label ? ` · ${relationship.label}` : ''}`));
          if (hasIdentity(relationship.semanticId)) {
            const provenance=el('details','canvas-grid-provenance');
            provenance.append(el('summary',null,'Native identity'));
            provenance.append(el('small',null,`Relationship: ${relationship.semanticId}`));
            if (relationship.qualifiedName) provenance.append(el('small',null,`Qualified name: ${relationship.qualifiedName}`));
            provenance.append(el('small',null,`Source: ${relationship.sourceSemanticId ?? 'unavailable'}`),el('small',null,`Target: ${relationship.targetSemanticId ?? 'unavailable'}`));
            item.append(provenance);
          }
          else item.append(el('small',null,'Relationship identity unavailable.'));
          list.append(item);
        }
        description.append(list);
      }
    } else {
      description.append(el('strong',null,selection.label || 'Empty value'));
      if (selection.kind === 'value-cell') description.append(el('p',null,'Native displayed value. This cell has no exported property identity.'));
      else if (!hasIdentity(selection.semanticId)) description.append(el('p',null,'Native semantic identity unavailable; model exploration is unavailable for this representation.'));
    }
    const canExplore = hasIdentity(selection.semanticId) || (selection.relationships ?? []).some(item => hasIdentity(item.sourceSemanticId) && hasIdentity(item.targetSemanticId));
    if (canExplore) description.append(button(selection.kind === 'relationship-cell' ? 'Explore relationship' : 'Explore element',() => options.onExplore?.(copy(state.selection)),'canvas-grid-explore'));
    inspector.append(description);
  };
  const highlight = () => {
    for (const {node,selection} of bindings) {
      const selected = samePosition(selection,state.selection) || state.selectedIds.some(id => semanticIdsFor(selection).includes(id));
      node.classList.toggle('is-selected',!!selected);
      if (node.tagName === 'BUTTON') node.setAttribute('aria-pressed',String(!!selected));
      const crosshair = matrix && state.selection?.kind === 'relationship-cell' && (selection.row === state.selection.row || selection.column === state.selection.column);
      node.classList.toggle('is-axis-highlight',!!crosshair);
    }
    const unknownRows = rows.filter(row => !hasIdentity(row.semanticId)).length;
    const missing = state.selectedIds.some(id => !nativeIds.has(id));
    disclosure.textContent = [
      ...(missing ? ['The selected element is not represented in this view. Your semantic selection is retained.'] : []),
      ...(unknownRows ? [`${unknownRows} row${unknownRows === 1 ? ' has' : 's have'} no exported semantic identity.`] : []),
    ].join(' ');
    disclosure.hidden = !disclosure.textContent;
  };
  const selectSelection = selection => {
    state.selection = copy(selection);
    state.selectedId = hasIdentity(selection.semanticId) ? selection.semanticId : null;
    state.selectedIds = semanticIdsFor(selection);
    highlight(); renderInspector(); changed();
    options.onSelect?.(copy(selection));
  };
  const applyWidths = () => {
    let totalWidth=0;
    for (const [index,col] of [...colgroup.children].entries()) {
      const width = Number(state.widths[index]);
      const appliedWidth=Number.isFinite(width) && width >= 80 && width <= 900 ? width : 200;
      col.style.width = `${appliedWidth}px`; totalWidth+=appliedWidth;
    }
    table.style.width=`${totalWidth}px`;
  };
  for (const [column,label] of columns.entries()) {
    colgroup.append(el('col'));
    const field = el('label',null,`${text(label) || `Column ${column+1}`} width`);
    const input = el('input'); input.type='number'; input.min='80'; input.max='900'; input.step='20';
    input.value=String(state.widths[column] ?? 200);
    input.setAttribute('aria-label',`${text(label) || `Column ${column+1}`} width in pixels`);
    input.addEventListener('change',() => {
      const width=Number(input.value);
      if (!Number.isFinite(width) || width < 80 || width > 900) { input.value=String(state.widths[column] ?? 200); return; }
      state.widths[column]=width; applyWidths(); changed();
    });
    field.append(input); widthFields.append(field);
  }
  const renderTable = () => {
    const scrollTop=viewport.scrollTop,scrollLeft=viewport.scrollLeft;
    bindings.length=0; thead.replaceChildren(); tbody.replaceChildren();
    const heading=el('tr');
    for (const [column,label] of columns.entries()) {
      const th=el('th'); th.scope='col';
      const selection=columnSelection(column);
      const select=bind(button(text(label) || `Column ${column+1}`,() => selectSelection(selection),'canvas-grid-heading'),selection);
      select.setAttribute('aria-label',`Inspect column ${text(label) || column+1}`); th.append(select);
      if (!matrix) {
        th.setAttribute('aria-sort',state.sort?.column===column ? state.sort.direction : 'none');
        const sort=button('↕',() => {
          state.sort={column,direction:state.sort?.column===column && state.sort.direction==='ascending' ? 'descending' : 'ascending'};
          renderTable();
          thead.querySelectorAll('.canvas-grid-sort')[column]?.focus({preventScroll:true});
          changed();
        },'canvas-grid-sort');
        sort.setAttribute('aria-label',`Sort by ${text(label) || `column ${column+1}`} ${state.sort?.column===column && state.sort.direction==='ascending' ? 'descending' : 'ascending'}`);
        th.append(sort);
      }
      heading.append(bind(th,selection));
    }
    thead.append(heading);
    for (const row of gridRowOrder(view,state.sort)) {
      const tr=el('tr'); tr.dataset.nativeRow=String(row);
      for (const [column] of columns.entries()) {
        const cell=el(column===0 ? 'th' : 'td'); if (column===0) cell.scope='row';
        const selection=column===0 ? rowSelection(row) : cellSelection(row,column);
        const displayed=text(rows[row].cells?.[column]);
        const label=displayed || (matrix && column>0 ? '—' : 'Empty');
        const select=bind(button(label,() => selectSelection(selection),'canvas-grid-value'),selection);
        select.setAttribute('aria-label',column===0 ? `Inspect row ${label}` : `Inspect ${text(columns[column])} for ${text(rows[row].cells?.[0])}: ${displayed || (matrix ? 'no matching relationship in this view' : 'empty value')}`);
        cell.append(select); tr.append(bind(cell,selection));
      }
      tbody.append(tr);
    }
    viewport.scrollTop=scrollTop; viewport.scrollLeft=scrollLeft;
    applyWidths(); highlight();
  };
  renderTable(); renderInspector();
  viewport.scrollTop=state.scrollTop; viewport.scrollLeft=state.scrollLeft;
  listen(viewport,'scroll',changed,{passive:true});
  // These gestures belong to the reading region, not the surrounding graph.
  for (const event of ['wheel','pointerdown','pointermove','pointerup','touchstart','touchmove','touchend','keydown']) {
    listen(shell,event,event => event.stopPropagation(),{passive:true});
  }
  const selectMany = ids => {
    state.selectedIds=[...new Set((ids ?? []).filter(hasIdentity))];
    state.selectedId=state.selectedIds.length===1 ? state.selectedIds[0] : null;
    state.selection=null;
    // External semantic highlighting must not trigger selection callbacks or scrolling.
    highlight(); renderInspector();
  };
  return {
    destroy() { if (destroyed) return; destroyed=true; for (const remove of listeners) remove(); shell.remove(); },
    getState,
    select(id) { selectMany(hasIdentity(id) ? [id] : []); },
    selectMany,
    reveal(id) {
      const match=bindings.find(binding => binding.node.tagName==='BUTTON' && semanticIdsFor(binding.selection).includes(id));
      if (!match) return false;
      match.node.scrollIntoView?.({block:'nearest',inline:'nearest'});
      return true;
    },
    anchors() {
      const clip=viewport.getBoundingClientRect(),origin=host.getBoundingClientRect();
      return bindings.filter(({node}) => node.tagName==='BUTTON').flatMap(({node,selection}) => {
        const rect=node.getBoundingClientRect();
        if (rect.width<=0 || rect.height<=0 || rect.bottom<=clip.top || rect.top>=clip.bottom || rect.right<=clip.left || rect.left>=clip.right) return [];
        const left=Math.max(clip.left,rect.left),top=Math.max(clip.top,rect.top);
        const right=Math.min(clip.right,rect.right),bottom=Math.min(clip.bottom,rect.bottom);
        return semanticIdsFor(selection).map((semanticId,index) => ({
          semanticId,role:selection.kind,row:selection.row,column:selection.column,
          representationId:`grid:${selection.kind}:${selection.row ?? ''}:${selection.column ?? ''}:${index}`,
          x:left-origin.left,y:top-origin.top,width:right-left,height:bottom-top,
        }));
      });
    },
  };
}
