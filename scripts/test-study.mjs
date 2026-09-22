import { registerHooks } from 'node:module';

// Node 24+ provides native TypeScript stripping and module resolution hooks.
registerHooks({
  resolve(specifier, context, nextResolve) {
    const normalized = specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)
      ? `${specifier}.ts`
      : specifier;
    return nextResolve(normalized, context);
  },
});
await import('../tests/study-model.test.ts');
await import('../tests/study-store.test.mjs');
await import('../tests/study-cloud.test.mjs');
await import('../tests/study-timer.test.ts');
await import('../tests/study-room.test.ts');
await import('../tests/study-template-update.test.ts');
await import('../tests/rich-text.test.ts');
