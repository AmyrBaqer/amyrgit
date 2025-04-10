const express = require('express');
const axios = require('axios');
const cors = require('cors');
const xml2js = require('xml2js');

const app = express();
app.use(cors());

const parser = new xml2js.Parser();

app.get('/news', async (req, res) => {
  try {
    const rssUrl = 'https://cointelegraph.com/rss';
    const response = await axios.get(rssUrl);
    
    parser.parseString(response.data, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'خطا در خواندن RSS' });
      }

      const items = result.rss.channel[0].item.slice(0, 5).map(item => ({
        title: item.title[0],
        summary: item.description[0].replace(/<[^>]*>?/gm, '').slice(0, 150) + '...',
        link: item.link[0],
        image: extractImageFromDescription(item.description[0]) || "https://cryptologos.cc/logos/bitcoin-btc-logo.png"
      }));

      res.json(items);
    });
  } catch (err) {
    res.status(500).json({ error: 'خطا در دریافت اخبار' });
  }
});

function extractImageFromDescription(description) {
  const match = description.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
