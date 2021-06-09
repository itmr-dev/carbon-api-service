const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/getCodeImage', async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.TOKEN}`) return res.status(401).send();

  const { code } = req.query;

  const url = `https://carbon.now.sh/?bg=rgba%2844%2C47%2C51%2C1%29&t=one-dark&wt=none&l=auto&ds=false&dsyoff=20px&dsblur=68px&wc=true&wa=true&pv=0px&ph=0px&ln=true&fl=1&fm=Hack&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=${code}`;
  // const url = `https://carbon.now.sh?bg=rgba(255%2C255%2C255%2C0)&code=${escape(message.content)}`;
  // const url = `https://carbon.now.sh?bg=rgba(44%2C47%2C51%2C1)&code=${escape(message.content)}`;
  const timeout = 2000;
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1600,
    height: 1000,
    deviceScaleFactor: 2,
  });
  await page.goto(url, {
    waitUntil: 'load',
  });
  const exportContainer = await page.waitForSelector('#export-container');
  const elementBounds = await exportContainer.boundingBox();
  const image = await exportContainer.screenshot({
    clip: {
      ...elementBounds,
      x: Math.round(elementBounds.x),
      height: Math.round(elementBounds.height) - 1,
    },
  });
  await page.waitFor(timeout);
  await browser.close();

  return res.status(200).send(image);
});

app.listen(process.env.PORT);
console.log(`webserver started on ${process.env.PORT}`);
