// utils/getRegions.js
export async function getRegions(proxyUrl = 'https://cors-anywhere.herokuapp.com/') {
  const targetBase = 'https://monitoring.miccedu.ru';
  const mainUrl = targetBase + '/?m=vpo&year=2016';

  // 1. Fetch main page through proxy
  const mainRes = await fetch(proxyUrl + mainUrl);
  if (!mainRes.ok) throw new Error(`Main page failed: ${mainRes.status}`);
  const mainHtml = await mainRes.text();

  // 2. Parse main page, extract iframe src
  const parser = new DOMParser();
  const mainDoc = parser.parseFromString(mainHtml, 'text/html');
  const iframe = mainDoc.querySelector('iframe[src*="stat"]') || mainDoc.querySelector('iframe');
  if (!iframe) throw new Error('Iframe not found');
  let iframeSrc = iframe.src;
  if (!iframeSrc.startsWith('http')) {
    iframeSrc = new URL(iframeSrc, targetBase).href;
  }

  // 3. Fetch iframe content through proxy
  const iframeRes = await fetch(proxyUrl + iframeSrc);
  if (!iframeRes.ok) throw new Error(`Iframe failed: ${iframeRes.status}`);
  const iframeHtml = await iframeRes.text();

  // 4. Parse iframe and extract regions
  const iframeDoc = parser.parseFromString(iframeHtml, 'text/html');
  const regionLinks = iframeDoc.querySelectorAll('#tregion a');
  if (!regionLinks.length) throw new Error('No regions found');

  // 5. Format and return
  return Array.from(regionLinks).map(link => ({
    name: link.textContent.trim(),
    url: link.href
  }));
}
