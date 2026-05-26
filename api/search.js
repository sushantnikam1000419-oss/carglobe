export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, type, carName } = req.body;

  // ── IMAGE FETCH ──────────────────────────────────────────────────────────
  if (type === 'images') {
    const name = (carName || '').toLowerCase();

    // Curated official/press image database for popular cars
    // Format: keyword -> [exterior, side, rear, interior, dashboard, seats]
    const DB = {
      'mahindra thar': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/40087/thar-exterior-right-front-three-quarter-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/40087/thar-exterior-right-side-view-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/40087/thar-exterior-rear-three-quarter.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/40087/thar-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/40087/thar-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/40087/thar-interior-seats.jpeg',
      ],
      'mahindra scorpio n': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/scorpio-n-exterior-right-front-three-quarter.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/scorpio-n-exterior-right-side-view.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/scorpio-n-exterior-rear-three-quarter.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/scorpio-n-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/scorpio-n-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/scorpio-n-interior-seats.jpeg',
      ],
      'mahindra xuv700': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/42355/xuv700-exterior-right-front-three-quarter.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/42355/xuv700-exterior-right-side-view.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/42355/xuv700-exterior-rear-three-quarter.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/42355/xuv700-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/42355/xuv700-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/42355/xuv700-interior-seats.jpeg',
      ],
      'mahindra be 6e': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/233403/be-6e-exterior-right-front-three-quarter.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/233403/be-6e-exterior-right-side-view.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/233403/be-6e-exterior-rear-three-quarter.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/233403/be-6e-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/233403/be-6e-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/233403/be-6e-interior-seats.jpeg',
      ],
      'hyundai creta': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/206751/creta-exterior-right-front-three-quarter-3.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/206751/creta-exterior-right-side-view-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/206751/creta-exterior-rear-three-quarter-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/206751/creta-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/206751/creta-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/206751/creta-interior-seats.jpeg',
      ],
      'tata nexon': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/141057/nexon-exterior-right-front-three-quarter-3.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/141057/nexon-exterior-right-side-view-3.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/141057/nexon-exterior-rear-three-quarter-3.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/141057/nexon-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/141057/nexon-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/141057/nexon-interior-seats.jpeg',
      ],
      'tata punch': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/115777/punch-exterior-right-front-three-quarter-5.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/115777/punch-exterior-right-side-view-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/115777/punch-exterior-rear-three-quarter-3.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/115777/punch-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/115777/punch-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/115777/punch-interior-seats.jpeg',
      ],
      'maruti swift': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/159089/swift-exterior-right-front-three-quarter-3.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/159089/swift-exterior-right-side-view-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/159089/swift-exterior-rear-three-quarter-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/159089/swift-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/159089/swift-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/159089/swift-interior-seats.jpeg',
      ],
      'maruti brezza': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/53621/brezza-exterior-right-front-three-quarter-6.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/53621/brezza-exterior-right-side-view-4.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/53621/brezza-exterior-rear-three-quarter-4.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/53621/brezza-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/53621/brezza-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/53621/brezza-interior-seats.jpeg',
      ],
      'maruti grand vitara': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/135095/grand-vitara-exterior-right-front-three-quarter-5.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/135095/grand-vitara-exterior-right-side-view-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/135095/grand-vitara-exterior-rear-three-quarter-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/135095/grand-vitara-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/135095/grand-vitara-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/135095/grand-vitara-interior-seats.jpeg',
      ],
      'maruti jimny': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/147087/jimny-exterior-right-front-three-quarter-3.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/147087/jimny-exterior-right-side-view-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/147087/jimny-exterior-rear-three-quarter-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/147087/jimny-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/147087/jimny-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/147087/jimny-interior-seats.jpeg',
      ],
      'kia seltos': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/seltos-exterior-right-front-three-quarter-3.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/seltos-exterior-right-side-view-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/seltos-exterior-rear-three-quarter-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/seltos-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/seltos-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130583/seltos-interior-seats.jpeg',
      ],
      'toyota fortuner': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/44709/fortuner-exterior-right-front-three-quarter-3.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/44709/fortuner-exterior-right-side-view-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/44709/fortuner-exterior-rear-three-quarter-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/44709/fortuner-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/44709/fortuner-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/44709/fortuner-interior-seats.jpeg',
      ],
      'hyundai ioniq 5': [
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130407/ioniq-5-exterior-right-front-three-quarter-3.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130407/ioniq-5-exterior-right-side-view-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130407/ioniq-5-exterior-rear-three-quarter-2.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130407/ioniq-5-interior-dashboard.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130407/ioniq-5-interior-steering-wheel.jpeg',
        'https://imgd.aeplcdn.com/664x374/n/cw/ec/130407/ioniq-5-interior-seats.jpeg',
      ],
    };

    // Check curated DB first
    for (const [key, imgs] of Object.entries(DB)) {
      if (name.includes(key) || key.split(' ').every(w => name.includes(w))) {
        return res.status(200).json({ images: imgs, source: 'curated' });
      }
    }

    // Fallback: Wikimedia Commons with strict exterior filter
    try {
      const angles = [
        carName + ' car exterior front',
        carName + ' automobile side view',
        carName + ' car rear view',
        carName + ' car interior dashboard',
        carName + ' car interior seats',
        carName + ' automobile',
      ];
      const allImgs = [];
      for (const q of angles) {
        try {
          const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=6&srlimit=2&format=json&origin=*`;
          const r = await fetch(url);
          const d = await r.json();
          for (const f of (d.query?.search || [])) {
            if (!/\.(jpg|jpeg|png)/i.test(f.title)) continue;
            if (/logo|flag|icon|map|seal|banner|diagram|chart/i.test(f.title)) continue;
            try {
              const ir = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(f.title)}&prop=imageinfo&iiprop=url|size&format=json&origin=*`);
              const id = await ir.json();
              const pg = Object.values(id.query?.pages || {})[0];
              const imgUrl = pg?.imageinfo?.[0]?.url;
              const w = pg?.imageinfo?.[0]?.width || 0;
              // Only wide images (landscape = exterior shots)
              if (imgUrl && w > 400 && !allImgs.includes(imgUrl)) {
                allImgs.push(imgUrl);
              }
            } catch(_) {}
          }
        } catch(_) {}
        if (allImgs.length >= 6) break;
      }
      return res.status(200).json({ images: allImgs.slice(0, 6), source: 'wikimedia' });
    } catch(e) {
      return res.status(200).json({ images: [], source: 'none' });
    }
  }

  // ── AI CAR DATA (Groq) ─────────────────────────────────────────────────
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: req.body.maxTokens || 3000,
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
