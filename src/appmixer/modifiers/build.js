/**
 * build.js — turns each modifier module in src/ into the deploy payload.
 *
 * The only transformation is `helperFn.toString()`: the real JS function we
 * author and test locally becomes the serialized string the Appmixer engine
 * stores. Output: build/modifiers.json (keyed by each module's `key`).
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const outDir = path.join(__dirname, 'build');

function build() {
    const modifiers = {};

    for (const file of fs.readdirSync(srcDir)) {
        if (!file.endsWith('.js')) continue;

        const m = require(path.join(srcDir, file));

        if (!m.key) {
            throw new Error(`${file}: missing "key" — every modifier needs a unique prefixed key.`);
        }
        if (typeof m.helperFn !== 'function') {
            throw new Error(`${file}: "helperFn" must be a function (got ${typeof m.helperFn}).`);
        }
        if (modifiers[m.key]) {
            throw new Error(`Duplicate modifier key "${m.key}" (in ${file}).`);
        }

        modifiers[m.key] = {
            label: m.label,
            // Required by the flow editor — entries without "type": "modifier"
            // are silently filtered out (the same object also stores triggers
            // with type "flow" and "separator" rows).
            type: 'modifier',
            category: m.category,
            description: m.description,
            arguments: m.arguments || [],
            returns: m.returns,
            helperFn: m.helperFn.toString()
        };
    }

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
        path.join(outDir, 'modifiers.json'),
        JSON.stringify(modifiers, null, 2)
    );

    console.log(`Built ${Object.keys(modifiers).length} modifiers -> build/modifiers.json`);
    return modifiers;
}

build();
