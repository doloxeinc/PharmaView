import { Fragment, useEffect, useRef, useState } from 'react';

const JOIN_OPTIONS = ['AND', 'OR', 'NOT'];
const VALUE_LOGIC_OPTIONS = ['OR', 'AND', 'NOT'];

// Conditions built from multiple checked values (Search fields modal) carry an
// op of 'in' / 'excludes' / 'includes all of' and a value string joined with
// ", " or " and ". Recover the individual values so the editor can show them
// as checkboxes instead of one unmatched dropdown option.
function splitValues(condition) {
  if (condition.op !== 'in' && condition.op !== 'excludes' && condition.op !== 'includes all of') return null;
  const sep = condition.op === 'includes all of' ? ' and ' : ', ';
  return condition.value.split(sep).map((v) => v.trim());
}

// Maps a condition's op back to the OR/AND/NOT logic it represents, so the
// editor can show which one is active and let the user switch it.
function opToLogic(op) {
  if (op === 'excludes') return 'NOT';
  if (op === 'includes all of') return 'AND';
  return 'OR';
}
function logicToOp(logic, valueCount) {
  if (valueCount === 1) return logic === 'NOT' ? '≠' : '=';
  if (logic === 'NOT') return 'excludes';
  if (logic === 'AND') return 'includes all of';
  return 'in';
}

// Inline editor for one condition's value. Reuses the field's known pick-list
// (same VALUE_OPTIONS data the Search fields modal uses) as a dropdown/
// checkbox-list when available, otherwise falls back to a plain text input —
// so editing an existing condition never requires deleting and re-adding it.
function ValueEditor({ condition, options, onSave, onCancel }) {
  const existingValues = splitValues(condition);
  const [draft, setDraft] = useState(condition.value);
  const [checked, setChecked] = useState(() => new Set(existingValues || []));
  const [logic, setLogic] = useState(() => opToLogic(condition.op));
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select?.();
  }, []);

  useEffect(() => {
    if (!existingValues) return undefined;
    const onOutsideClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) onCancel();
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onSave({ value: trimmed, op: condition.op });
    else onCancel();
  };

  // Multi-value condition on a field with a known pick-list -> checkbox list
  // plus the OR/AND/NOT logic picker, so both which values are picked AND how
  // they combine (any of / all of / none of) can be changed in place.
  if (existingValues && options) {
    const toggle = (v) => {
      setChecked((prev) => {
        const next = new Set(prev);
        next.has(v) ? next.delete(v) : next.add(v);
        return next;
      });
    };
    const save = () => {
      const values = options.filter((o) => checked.has(o));
      if (values.length === 0) return onCancel();
      const op = logicToOp(logic, values.length);
      if (values.length === 1) return onSave({ value: values[0], op });
      const sep = logic === 'AND' ? ' and ' : ', ';
      onSave({ value: values.join(sep), op });
    };
    return (
      <div className="qval-edit-multi" ref={wrapRef}>
        <div className="value-logic-row">
          <span className="value-logic-label">Match</span>
          <div className="value-logic-seg">
            {VALUE_LOGIC_OPTIONS.map((o) => (
              <button key={o} type="button" data-logic={o} className={logic === o ? 'active' : ''} onClick={() => setLogic(o)}>
                {o}
              </button>
            ))}
          </div>
        </div>
        {options.map((o) => (
          <label key={o} className="qval-edit-multi-opt">
            <input type="checkbox" checked={checked.has(o)} onChange={() => toggle(o)} />
            {o}
          </label>
        ))}
        <div className="qval-edit-multi-actions">
          <button className="btn btn-sm btn-primary" onClick={save}>
            Done
          </button>
        </div>
      </div>
    );
  }

  if (options) {
    return (
      <select
        ref={inputRef}
        className="qval-edit qval-edit-select"
        value={draft}
        onChange={(e) => onSave({ value: e.target.value, op: condition.op })}
        onBlur={onCancel}
      >
        {!options.includes(condition.value) && <option value={condition.value}>{condition.value}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      className="qval-edit"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') onCancel();
      }}
    />
  );
}

export default function SearchBuilder({ open, conditions, setConditions, onRunSearch, onClear, blankCondition, valueOptions }) {
  const [editingIndex, setEditingIndex] = useState(null);

  // NOT reads as "AND NOT" in the criteria summary, i.e. it excludes rows
  // matching this condition rather than requiring them.
  const setJoin = (index, join) => {
    setConditions((prev) => prev.map((c, i) => (i === index ? { ...c, join } : c)));
  };

  const setValue = (index, { value, op }) => {
    setConditions((prev) => prev.map((c, i) => (i === index ? { ...c, value, op } : c)));
  };

  const removeCondition = (index) => {
    setConditions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next[0]) delete next[0].join;
      return next;
    });
    setEditingIndex(null);
  };

  const addBlankCondition = () => {
    setConditions((prev) => [...prev, { ...blankCondition, join: prev.length ? 'AND' : undefined }]);
  };

  const clearAll = () => {
    setConditions([]);
    onClear?.();
    setEditingIndex(null);
  };

  const joinClass = (join) => (join === 'OR' ? 'or' : join === 'NOT' ? 'not' : '');

  return (
    <div className={`qbuilder ${open ? 'open' : ''}`}>
      <div className="qbuilder-head">
        <h3>Search builder</h3>
        <button className="btn btn-ghost btn-sm" onClick={clearAll}>
          Clear all
        </button>
      </div>

      <div className="qchain">
        {conditions.map((c, i) => (
          <Fragment key={`${c.field}-${i}`}>
            {i > 0 && (
              <div className="qbond">
                <div className="qbond-seg">
                  {JOIN_OPTIONS.map((o) => (
                    <span
                      key={o}
                      className={`qbond-tag ${joinClass(o)} ${c.join === o ? 'active' : ''}`}
                      onClick={() => setJoin(i, o)}
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="qnode">
              <span className="qseg qfield">{c.field}</span>
              <span className="qseg qop">{c.op}</span>
              {editingIndex === i ? (
                <ValueEditor
                  condition={c}
                  options={valueOptions[c.field]}
                  onSave={(value) => {
                    setValue(i, value);
                    setEditingIndex(null);
                  }}
                  onCancel={() => setEditingIndex(null)}
                />
              ) : (
                <span className="qseg qval" title="Click to edit" onClick={() => setEditingIndex(i)}>
                  {c.value}
                </span>
              )}
              <button className="qnode-remove" onClick={() => removeCondition(i)}>
                ✕
              </button>
            </div>
          </Fragment>
        ))}
      </div>

      <div className="qbuilder-actions">
        <button className="qadd" onClick={addBlankCondition}>
          + Add condition
        </button>
        <button className="btn btn-primary btn-sm" onClick={onRunSearch}>
          Run search
        </button>
      </div>
    </div>
  );
}
