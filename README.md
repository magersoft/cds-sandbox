# Cds Sandbox

This is a sandbox for the Central Design System based on Vue.js 3

https://magersoft.github.io/cds-sandbox/

## Admin mode (permanent links)

Permanent links toggle is shown only when `isAdmin` is enabled.

Enable with either:

- Cookie: `isAdmin=true` (also accepts `1/yes/on`)
- LocalStorage (higher priority): `cds-is-admin=true`

Example in DevTools console:

```js
localStorage.setItem('cds-is-admin', 'true')
// or
// document.cookie = 'isAdmin=true; path=/'
```
