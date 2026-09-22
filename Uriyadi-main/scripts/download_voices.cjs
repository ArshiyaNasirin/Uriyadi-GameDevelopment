const https = require('https');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'audio', 'voices');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const phrases = {
  forward: 'நேரா போப்பா! தைரியமா முன்னாடி வா!',
  left: 'தம்பி, இடது பக்கம் திரும்பு!',
  right: 'வலது பக்கம் வாப்பா! வலது!',
  close: 'பானை பக்கத்துல வந்துட்ட! நிதானமா நில்லு!',
  strike: 'அடிடா கதிர் அடி! இப்போதே அடி!',
  strike_kids: 'அடி! அடி! உடைச்சுடு! பொங்கலோ பொங்கல்!',
  miss: 'அடடா! நூல் இழைல போச்சு! இன்னும் ஒரு முறை அடி!',
};

async function downloadPhrase(key, text) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ta&client=tw-ob&q=${encodeURIComponent(text)}`;
  const dest = path.join(outDir, `${key}.mp3`);
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed with status ${res.statusCode} for ${key}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`Saved ${key}.mp3 (${fs.statSync(dest).size} bytes)`);
          resolve();
        });
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const [key, text] of Object.entries(phrases)) {
    try {
      await downloadPhrase(key, text);
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.error(`Error downloading ${key}:`, e.message);
    }
  }
  console.log('Finished downloading all Tamil voice assets!');
}

run();
