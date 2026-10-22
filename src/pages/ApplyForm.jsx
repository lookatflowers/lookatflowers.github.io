import { useEffect, useRef, useState } from 'react'
import Rich from '../components/Rich'
import { festival } from '../data/festival'
import { useLang } from '../i18n/useLang'
import { buildEmail } from '../utils/applyEmail'

const emptyRow = (columns) => Object.fromEntries(columns.map((c) => [c.id, '']))

function readDraft(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (saved && typeof saved === 'object') return saved
  } catch {
    /* sin borrador guardado o almacenamiento bloqueado */
  }
  return {}
}

function Label({ htmlFor, field }) {
  const { t, tr } = useLang()
  return (
    <label className="field__label" htmlFor={htmlFor}>
      {tr(field.label)}
      {field.required && <span className="field__req" aria-label={t('apply.required')}> *</span>}
    </label>
  )
}

function Hint({ id, field }) {
  const { tr } = useLang()
  return field.hint ? <p className="field__hint" id={id}>{tr(field.hint)}</p> : null
}

/** Filas de integrantes / equipo: cada fila es una tarjeta con sus columnas. */
function Members({ uid, field, rows, onChange }) {
  const { t, tr } = useLang()
  const list = rows?.length ? rows : [emptyRow(field.columns)]
  const update = (i, col, value) => onChange(list.map((row, n) => (n === i ? { ...row, [col]: value } : row)))

  return (
    <fieldset className="field field--wide members" aria-describedby={field.hint ? `${uid}-hint` : undefined}>
      <legend className="field__label">{tr(field.label)}</legend>
      <Hint id={`${uid}-hint`} field={field} />
      {list.map((row, i) => (
        <div className="members__row" key={i} role="group" aria-label={t('apply.row').replace('{n}', i + 1)}>
          <span className="members__n" aria-hidden="true">{i + 1}</span>
          {field.columns.map((col) => (
            <div className="members__cell" key={col.id}>
              <label className="members__label" htmlFor={`${uid}-${i}-${col.id}`}>{tr(col.label)}</label>
              <input id={`${uid}-${i}-${col.id}`} className="input" type="text" value={row[col.id] ?? ''} onChange={(e) => update(i, col.id, e.target.value)} />
            </div>
          ))}
          {list.length > 1 && (
            <button type="button" className="members__remove" onClick={() => onChange(list.filter((_, n) => n !== i))}>
              {t('apply.removeRow')}
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn btn--ghost" onClick={() => onChange([...list, emptyRow(field.columns)])}>
        + {t('apply.addRow')}
      </button>
    </fieldset>
  )
}

function Field({ appId, field, value, onChange }) {
  const { tr } = useLang()
  const uid = `${appId}-${field.id}`
  const describedBy = field.hint ? `${uid}-hint` : undefined

  if (field.type === 'members') return <Members uid={uid} field={field} rows={value} onChange={onChange} />

  if (field.type === 'radio') {
    return (
      <fieldset className="field field--wide" aria-describedby={describedBy}>
        <legend className="field__label">
          {tr(field.label)}{field.required && <span className="field__req" aria-hidden="true"> *</span>}
        </legend>
        <Hint id={describedBy} field={field} />
        <div className="choices">
          {field.options.map((opt, i) => (
            <label className="choice" key={i}>
              <input type="radio" name={uid} value={i} required={field.required} checked={value === String(i)} onChange={(e) => onChange(e.target.value)} />
              <span>{tr(opt)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  const common = {
    id: uid,
    className: 'input',
    required: field.required,
    value: value ?? '',
    'aria-describedby': describedBy,
    onChange: (e) => onChange(e.target.value),
  }
  let control
  if (field.type === 'textarea') {
    control = <textarea {...common} rows={4} maxLength={field.maxLength} />
  } else if (field.type === 'select') {
    control = (
      <select {...common}>
        <option value="" disabled>—</option>
        {field.options.map((opt, i) => <option key={i} value={String(i)}>{tr(opt)}</option>)}
      </select>
    )
  } else if (field.type === 'url') {
    // type="text": se aceptan enlaces sin https:// (p. ej. instagram.com/...)
    control = <input {...common} type="text" inputMode="url" autoCapitalize="off" spellCheck={false} placeholder={tr(field.placeholder) || undefined} />
  } else {
    control = (
      <input
        {...common}
        type={field.type}
        min={field.min}
        max={field.max}
        inputMode={field.type === 'number' ? 'numeric' : undefined}
        autoComplete={field.autoComplete}
        placeholder={tr(field.placeholder) || undefined}
      />
    )
  }

  return (
    <div className={`field${field.type === 'textarea' ? ' field--wide' : ''}`}>
      <Label htmlFor={uid} field={field} />
      <Hint id={describedBy} field={field} />
      {control}
      {field.maxLength && <span className="field__count" aria-hidden="true">{String(value ?? '').length}/{field.maxLength}</span>}
    </div>
  )
}

/** Pantalla final: el correo queda listo para abrir o copiar. */
function Ready({ app, values, onEdit }) {
  const { t, tr } = useLang()
  const ref = useRef(null)
  const [copied, setCopied] = useState(false)
  const { subject, body, mailto } = buildEmail(app, values)

  useEffect(() => { ref.current?.focus() }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body)
      setCopied(true)
    } catch {
      document.getElementById(`${app.id}-body`)?.select() // respaldo: queda seleccionado para Ctrl+C
    }
  }

  return (
    <section className="ready" aria-labelledby={`${app.id}-ready`}>
      <h3 id={`${app.id}-ready`} ref={ref} tabIndex={-1} className="ready__title">{t('apply.readyTitle')}</h3>
      <ol className="ready__steps">
        <li>{t('apply.step1')}</li>
        {app.attachments.length > 0 && (
          <li>
            {t('apply.step2')}
            <ul>{app.attachments.map((a, i) => <li key={i}><Rich text={tr(a)} /></li>)}</ul>
          </li>
        )}
        <li>{t('apply.step3')} <strong>{festival.email}</strong></li>
      </ol>
      <div className="ready__actions">
        <a className="btn btn--primary" href={mailto}>📩 {t('apply.openMail')}</a>
        <button type="button" className="btn btn--ghost" onClick={copy} aria-live="polite">
          {copied ? `✔ ${t('apply.copied')}` : t('apply.copy')}
        </button>
      </div>
      <p className="ready__fallback">{t('apply.copyFallback')}</p>
      <p className="ready__subject"><span>{t('apply.subject')}:</span> <strong>{subject}</strong></p>
      <textarea id={`${app.id}-body`} className="input ready__body" readOnly value={body} rows={10} aria-label={t('apply.copy')} />
      <button type="button" className="btn btn--link" onClick={onEdit}>← {t('apply.edit')}</button>
    </section>
  )
}

/** Formulario de una convocatoria. Guarda un borrador en este dispositivo mientras se escribe. */
export default function ApplyForm({ app, closed }) {
  const { t, tr } = useLang()
  const storageKey = `laf-apply-${app.id}`
  const [values, setValues] = useState(() => readDraft(storageKey))
  const [accepted, setAccepted] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(values))
    } catch {
      /* sin almacenamiento: el formulario funciona igual, solo no guarda borrador */
    }
  }, [storageKey, values])

  if (closed) return <p className="placeholder">{t('apply.closedText')}</p>
  if (ready) return <Ready app={app} values={values} onEdit={() => setReady(false)} />

  const set = (id) => (value) => setValues((prev) => ({ ...prev, [id]: value }))
  const onSubmit = (e) => {
    e.preventDefault() // el navegador ya validó los campos obligatorios
    setReady(true)
    window.scrollTo({ top: e.currentTarget.closest('.apply-panel').offsetTop - 80, behavior: 'smooth' })
  }
  const clear = () => {
    if (window.confirm(t('apply.clearConfirm'))) {
      setValues({})
      setAccepted(false)
    }
  }

  return (
    <form className="apply-form" onSubmit={onSubmit}>
      <p className="apply-form__intro">⏱️ {t('apply.formIntro').replace('{time}', tr(app.time))}</p>
      <p className="apply-form__draft">💾 {t('apply.draftSaved')}</p>

      {app.sections.map((section, i) => (
        <fieldset className="step" key={i}>
          <legend className="step__title"><span className="step__n" aria-hidden="true">{i + 1}</span>{tr(section.title)}</legend>
          {section.hint && <p className="step__hint">{tr(section.hint)}</p>}
          <div className="step__grid">
            {section.fields.map((field) => (
              <Field key={field.id} appId={app.id} field={field} value={values[field.id]} onChange={set(field.id)} />
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset className="step step--commit">
        <legend className="step__title"><span className="step__n" aria-hidden="true">✓</span>{t('apply.commitments')}</legend>
        <ul className="commitments">
          {app.commitments.map((c, i) => <li key={i}>{tr(c)}</li>)}
        </ul>
        <label className="accept">
          <input type="checkbox" required checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span>{t('apply.accept')}</span>
        </label>
      </fieldset>

      <div className="apply-form__submit">
        <button type="submit" className="btn btn--primary btn--big">{t('apply.submit')} →</button>
        <p className="field__hint">{t('apply.submitHint')}</p>
        <button type="button" className="btn btn--link" onClick={clear}>{t('apply.clear')}</button>
      </div>
    </form>
  )
}
