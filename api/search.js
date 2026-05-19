export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, type, carName } = req.body;

  // IMAGE FETCH from Wikimedia - unlimited, free, legal
  if (type === 'images') {
    try {
      const query = encodeURIComponent(carName);
      
      // Search Wikimedia for car images
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${query}&prop=images&imlimit=20&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      
      const pages = searchData.query?.pages || {};
      const page = Object.values(pages)[0];
      const imageFiles = (page?.images || [])
        .map(img => img.title)
        .filter(t => /\.(jpg|jpeg|png|webp)/i.test(t) && 
                     !t.toLowerCase().includes('logo') &&
                     !t.toLowerCase().includes('flag') &&
                     !t.toLowerCase().includes('icon') &&
                     !t.toLowerCase().includes('map'));

      // Get actual image URLs
      const imageUrls = [];
      for (const file of imageFiles.slice(0, 12)) {
        try {
          const infoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(file)}&prop=imageinfo&iiprop=url|size&format=json&origin=*`;
          const infoRes = await fetch(infoUrl);
          const infoData = await infoRes.json();
          const infoPages = infoData.query?.pages || {};
          const infoPage = Object.values(infoPages)[0];
          const url = infoPage?.imageinfo?.[0]?.url;
          if (url) imageUrls.push(url);
        } catch(_) {}
      }

      // Also search Wikimedia Commons for more images
      const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${query}+car&srnamespace=6&srlimit=10&format=json&origin=*`;
      const commonsRes = await fetch(commonsUrl);
      const commonsData = await commonsRes.json();
      const commonsFiles = commonsData.query?.search || [];
      
      for (const file of commonsFiles.slice(0, 8)) {
        try {
          const title = file.title;
          if (!/\.(jpg|jpeg|png|webp)/i.test(title)) continue;
          const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
          const infoRes = await fetch(infoUrl);
          const infoData = await infoRes.json();
          const infoPages = infoData.query?.pages || {};
          const infoPage = Object.values(infoPages)[0];
          const url = infoPage?.imageinfo?.[0]?.url;
          if (url && !imageUrls.includes(url)) imageUrls.push(url);
        } catch(_) {}
      }

      return res.status(200).json({ images: imageUrls.slice(0, 10) });
    } catch(e) {
      return res.status(200).json({ images: [] });
    }
  }

  // AI CAR DATA from Groq
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
