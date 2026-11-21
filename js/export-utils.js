/**
 * Export and Download Utilities for Client Carousel Studio
 * Zero external dependencies. Pure client-side PNG and ZIP generation.
 */

'use strict';

function triggerDownload(blob, name) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 15000);
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('PNG export failed'));
    }, 'image/png');
  });
}

function crc32(bytes) {
  let crc = 0xFFFFFFFF;
  for (const b of bytes) {
    crc ^= b;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xEDB88320);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function u16(view, offset, n) {
  view.setUint16(offset, n, true);
}

function u32(view, offset, n) {
  view.setUint32(offset, n, true);
}

function createZip(items) {
  const encoder = new TextEncoder();
  const parts = [];
  const centers = [];
  let offset = 0;

  for (const [name, bytes] of items) {
    const nb = encoder.encode(name);
    const crc = crc32(bytes);
    const local = new Uint8Array(30 + nb.length);
    const v = new DataView(local.buffer);

    u32(v, 0, 0x04034b50);
    u16(v, 4, 20);
    u16(v, 6, 0);
    u16(v, 8, 0);
    u16(v, 10, 0);
    u16(v, 12, 0);
    u32(v, 14, crc);
    u32(v, 18, bytes.length);
    u32(v, 22, bytes.length);
    u16(v, 26, nb.length);
    u16(v, 28, 0);
    local.set(nb, 30);

    parts.push(local, bytes);

    const central = new Uint8Array(46 + nb.length);
    const c = new DataView(central.buffer);
    u32(c, 0, 0x02014b50);
    u16(c, 4, 20);
    u16(c, 6, 20);
    u16(c, 8, 0);
    u16(c, 10, 0);
    u16(c, 12, 0);
    u16(c, 14, 0);
    u32(c, 16, crc);
    u32(c, 20, bytes.length);
    u32(c, 24, bytes.length);
    u16(c, 28, nb.length);
    u16(c, 30, 0);
    u16(c, 32, 0);
    u16(c, 34, 0);
    u16(c, 36, 0);
    u32(c, 38, 0);
    u32(c, 42, offset);
    central.set(nb, 46);

    centers.push(central);
    offset += local.length + bytes.length;
  }

  const centerSize = centers.reduce((sum, p) => sum + p.length, 0);
  const end = new Uint8Array(22);
  const v = new DataView(end.buffer);
  u32(v, 0, 0x06054b50);
  u16(v, 4, 0);
  u16(v, 6, 0);
  u16(v, 8, items.length);
  u16(v, 10, items.length);
  u32(v, 12, centerSize);
  u32(v, 16, offset);
  u16(v, 20, 0);

  return new Blob([...parts, ...centers, end], { type: 'application/zip' });
}

window.ExportUtils = {
  triggerDownload,
  canvasBlob,
  createZip
};

