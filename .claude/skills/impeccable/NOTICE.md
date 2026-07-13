# Instalación local de impeccable — procedencia

Skill original: [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0).

Esta es una **instalación parcial transcrita** desde el repositorio oficial
(rama `main`, SKILL.md v3.9.1) porque la política de red de este entorno
bloquea el instalador oficial (`impeccable.style` y `skills.sh` denegados).

- `SKILL.md` y `reference/{product,audit,critique,polish}.md`: contenido oficial.
- Referencias no incluidas (craft, shape, layout, typeset, etc.): descargarlas
  igual desde `https://raw.githubusercontent.com/pbakaus/impeccable/main/.claude/skills/impeccable/reference/<cmd>.md`
  cuando se necesiten.
- `scripts/*.mjs`: **shims locales**, no los originales. Implementan el contrato
  documentado en SKILL.md; `detect.mjs` delega en el motor oficial del paquete
  npm (`npx impeccable detect`). El modo `live` y los hooks no están instalados.
