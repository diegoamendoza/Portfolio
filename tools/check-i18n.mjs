/*
 * Comprueba que los textos del sitio y los archivos de traducción no se separen.
 *
 *   node tools/check-i18n.mjs      (o: npm run check:i18n)
 *
 * Revisa tres cosas:
 *   1. Que es.json y en.json tengan exactamente las mismas claves.
 *   2. Que toda clave usada en el HTML (data-translate, data-translate-alt,
 *      data-translate-title, data-translate-aria-label) exista en ambos idiomas.
 *   3. Que el texto en español escrito en el HTML (el respaldo que ven los
 *      buscadores) coincida con el de es.json.
 *
 * Sale con código 1 si hay errores; los desajustes del punto 3 son avisos.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const IGNORE_DIRS = new Set([".git", "node_modules", "particles.js-master", "meow-jump", "ColorSortWeb", "tools"]);

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const es = JSON.parse(read("i18n/es.json"));
const en = JSON.parse(read("i18n/en.json"));

let errors = 0;
let warnings = 0;

const error = (msg) => { console.error("ERROR  " + msg); errors++; };
const warn = (msg) => { console.warn("AVISO  " + msg); warnings++; };

// 1. Paridad de claves
for (const key of Object.keys(es)) if (!(key in en)) error(`falta la clave "${key}" en i18n/en.json`);
for (const key of Object.keys(en)) if (!(key in es)) error(`falta la clave "${key}" en i18n/es.json`);

// 2 y 3. Claves usadas en el HTML
function htmlFiles(dir = "") {
    const out = [];
    for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
        if (IGNORE_DIRS.has(entry.name)) continue;
        const rel = dir ? `${dir}/${entry.name}` : entry.name;
        if (entry.isDirectory()) out.push(...htmlFiles(rel));
        else if (entry.name.endsWith(".html")) out.push(rel);
    }
    return out;
}

const normalize = (value) => value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ATTR_KEYS = ["data-translate-alt", "data-translate-title", "data-translate-aria-label"];

for (const file of htmlFiles()) {
    const html = read(file);

    for (const attr of ATTR_KEYS) {
        for (const match of html.matchAll(new RegExp(`${attr}="([^"]+)"`, "g"))) {
            const key = match[1];
            if (!(key in es)) error(`${file}: la clave "${key}" (${attr}) no existe en i18n/es.json`);
        }
    }

    // data-translate="clave" ... > texto de respaldo <
    for (const match of html.matchAll(/data-translate="([^"]+)"([^>]*)>([\s\S]*?)<\/(\w+)>/g)) {
        const [, key, , inner] = match;
        if (!(key in es)) { error(`${file}: la clave "${key}" no existe en i18n/es.json`); continue; }
        // Con etiquetas anidadas (distintas de <br>) el recorte de arriba no es fiable:
        // en ese caso sólo se comprueba que la clave exista.
        if (/<(?!br\s*\/?>)/i.test(inner)) continue;
        const fallback = normalize(inner);
        const source = normalize(String(es[key]));
        if (fallback && source && fallback !== source) {
            warn(`${file}: el texto de respaldo de "${key}" no coincide con i18n/es.json`);
            console.warn(`       html: ${fallback.slice(0, 90)}`);
            console.warn(`       json: ${source.slice(0, 90)}`);
        }
    }
}

console.log(`\nResultado: ${errors} error(es), ${warnings} aviso(s).`);
process.exit(errors > 0 ? 1 : 0);
