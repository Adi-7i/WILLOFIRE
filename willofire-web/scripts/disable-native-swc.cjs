'use strict';

const Module = require('module');

const blocked = new Set([
  '@next/swc-linux-x64-gnu',
  '@next/swc-linux-x64-musl',
]);

const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
  if (blocked.has(request)) {
    const err = new Error(`Cannot find module '${request}'`);
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
