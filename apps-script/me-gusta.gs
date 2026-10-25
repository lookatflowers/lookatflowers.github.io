/**
 * LOOK AT FLOWERS · Receptor de "me gusta" de la web
 * ---------------------------------------------------------------
 * La web envía cada me gusta (o su anulación) a esta URL. El script lo anota en la pestaña
 * "Me gusta" de la planilla "Postulaciones LOOKAT E2": una fila por visitante y artista/puesto,
 * con 1 (le gusta) o 0 (lo quitó). La pestaña "Ranking me gusta" suma todo sola.
 *
 * Es anónimo: el "visitante" es un código al azar que genera el navegador; no hay nombres,
 * correos ni IP. Solo se aceptan nombres que estén publicados en la web.
 *
 * INSTALACIÓN (una sola vez):
 *  1. script.google.com → Nuevo proyecto → nómbralo "Me gusta LOOKAT" → pega este archivo.
 *  2. Implementar → Nueva implementación → tipo "Aplicación web".
 *       Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario.
 *  3. Autoriza los permisos y copia la URL que termina en /exec. Esa URL va en la web.
 * Si cambias el código: Implementar → Gestionar implementaciones → editar → Versión nueva
 * (así la URL no cambia).
 */

const ME_GUSTA = {
  SPREADSHEET_ID: '1sA52e7eWWayT1U2zC_i-r1B_PI0hWXJTQoal2dxx0pg',
  PESTANA: 'Me gusta',
  TIPOS: ['Banda', 'DJ', 'Puesto'],
  MAX_POR_VISITANTE: 120, // cambios por visitante cada 10 minutos (frena abusos)
};

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const tipo = String(data.type || '');
    const nombre = String(data.name || '').trim().slice(0, 150);
    const visitante = String(data.visitor || '');
    const meGusta = data.liked ? 1 : 0;

    if (!ME_GUSTA.TIPOS.includes(tipo)) return respuesta_({ ok: false, error: 'tipo' });
    if (!/^[a-z0-9-]{16,64}$/i.test(visitante)) return respuesta_({ ok: false, error: 'visitante' });
    if (!nombrePublicado_(tipo, nombre)) return respuesta_({ ok: false, error: 'nombre' });
    if (!dentroDelLimite_(visitante)) return respuesta_({ ok: false, error: 'limite' });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const hoja = SpreadsheetApp.openById(ME_GUSTA.SPREADSHEET_ID).getSheetByName(ME_GUSTA.PESTANA);
      const clave = `${visitante}|${tipo}|${nombre}`;
      const ahora = new Date();
      const celda = hoja.getRange('A:A').createTextFinder(clave).matchEntireCell(true).findNext();
      if (celda) {
        hoja.getRange(celda.getRow(), 4).setValue(meGusta);
        hoja.getRange(celda.getRow(), 7).setValue(ahora);
      } else {
        hoja.appendRow([clave, tipo, nombre, meGusta, visitante, ahora, ahora]);
      }
    } finally {
      lock.releaseLock();
    }
    return respuesta_({ ok: true });
  } catch (err) {
    return respuesta_({ ok: false, error: String(err) });
  }
}

/** Para revisar que la URL funciona: al abrirla en el navegador responde {"ok":true}. */
function doGet() {
  return respuesta_({ ok: true, servicio: 'me gusta LOOKAT' });
}

/** Solo acepta artistas y puestos con "Publicar" marcado (lista guardada 10 min en caché). */
function nombrePublicado_(tipo, nombre) {
  if (!nombre) return false;
  const cache = CacheService.getScriptCache();
  let lista = cache.get('publicados');
  if (!lista) {
    const libro = SpreadsheetApp.openById(ME_GUSTA.SPREADSHEET_ID);
    const nombres = [];
    libro.getSheetByName('Web Line-up').getDataRange().getValues().slice(2).forEach((f) => {
      if (f[0] === true && f[2]) nombres.push(`${f[1] === 'DJ' ? 'DJ' : 'Banda'}|${String(f[2]).trim()}`);
    });
    libro.getSheetByName('Web Puestos').getDataRange().getValues().slice(2).forEach((f) => {
      if (f[0] === true && f[1]) nombres.push(`Puesto|${String(f[1]).trim()}`);
    });
    lista = JSON.stringify(nombres);
    cache.put('publicados', lista, 600);
  }
  return JSON.parse(lista).includes(`${tipo}|${nombre}`);
}

function dentroDelLimite_(visitante) {
  const cache = CacheService.getScriptCache();
  const k = `lim_${visitante}`;
  const n = Number(cache.get(k) || 0) + 1;
  cache.put(k, String(n), 600);
  return n <= ME_GUSTA.MAX_POR_VISITANTE;
}

function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
