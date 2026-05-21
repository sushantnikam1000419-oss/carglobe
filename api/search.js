export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, type, carName, brand, model } = req.body;

  // ── IMAGE FETCH ─────────────────────────────────────────────────────────
  if (type === 'images') {
    const angles = [
      { label: 'exterior', query: `${carName} car exterior front` },
      { label: 'side',     query: `${carName} car side view` },
      { label: 'rear',     query: `${carName} car rear back` },
      { label: 'interior', query: `${carName} car interior cabin` },
      { label: 'dashboard',query: `${carName} car dashboard` },
      { label: 'seats',    query: `${carName} car seats` },
    ];

    const allImages = [];

    // Try Wikimedia Commons for each angle
    for (const angle of angles) {
      try {
        const q = encodeURIComponent(angle.query);
        const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${q}&srnamespace=6&srlimit=3&format=json&origin=*`;
        const r = await fetch(url);
        const d = await r.json();
        const files = d.query?.search || [];

        for (const file of files) {
          const title = file.title;
          if (!/\.(jpg|jpeg|png|webp)/i.test(title)) continue;
          if (/logo|flag|icon|map|coat|seal|banner/i.test(title)) continue;
          try {
            const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|mime|size&format=json&origin=*`;
            const ir = await fetch(infoUrl);
            const id = await ir.json();
            const page = Object.values(id.query?.pages || {})[0];
            const imgUrl = page?.imageinfo?.[0]?.url;
            const mime = page?.imageinfo?.[0]?.mime || '';
            if (imgUrl && mime.startsWith('image/') && !allImages.includes(imgUrl)) {
              allImages.push(imgUrl);
            }
          } catch(_) {}
        }
      } catch(_) {}

      if (allImages.length >= 10) break;
    }

    // If not enough images, try Wikipedia article images
    if (allImages.length < 4) {
      try {
        const wq = encodeURIComponent(carName);
        const wurl = `https://en.wikipedia.org/w/api.php?action=query&titles=${wq}&prop=images&imlimit=15&format=json&origin=*`;
        const wr = await fetch(wurl);
        const wd = await wr.json();
        const pages = wd.query?.pages || {};
        const page = Object.values(pages)[0];
        const imgs = (page?.images || []).filter(i =>
          /\.(jpg|jpeg|png)/i.test(i.title) &&
          !/logo|flag|icon|map|coat|seal/i.test(i.title)
        );
        for (const img of imgs.slice(0, 6)) {
          try {
            const iu = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(img.title)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
            const ir = await fetch(iu);
            const id = await ir.json();
            const p = Object.values(id.query?.pages || {})[0];
            const u = p?.imageinfo?.[0]?.url;
            if (u && !allImages.includes(u)) allImages.push(u);
          } catch(_) {}
        }
      } catch(_) {}
    }

    return res.status(200).json({ images: allImages.slice(0, 12) });
  }

  // ── AI CAR DATA (Groq) ───────────────────────────────────────────────────
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await r.json();
    if (data.error) throw new Error(data.error.message);
    const text = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ content: [{ text }] });
  } catch(e) {
    res.status(500).json({ error: { message: e.message } });
  }
}
