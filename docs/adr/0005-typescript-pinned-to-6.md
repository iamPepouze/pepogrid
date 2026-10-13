# TypeScript stays on 6 until vue-tsc supports 7

TypeScript is pinned to `^6` although 7 is out, because vue-tsc (needed to type-check `.vue` files) crashes on TypeScript 7: it loads `typescript/lib/tsc`, which 7 no longer exports. Checked last with vue-tsc 3.3.13 and TypeScript 7.0.2. Dropping vue-tsc for plain `tsc` was rejected because the components' `<script setup>` blocks would no longer be type-checked. Upgrade once a vue-tsc release supports TypeScript 7.
