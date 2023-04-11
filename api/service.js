const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');  
const compFunctionExports = require('./company_function');
const bodyParser = require('body-parser');

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.post('/research', async (req, res) => {
  const searchTerm = req.body.searchTerm;
  
  const browser = await puppeteer.launch({
    userDataDir: ("./user_data"),
    headless: true,
  });
  
  const page = await browser.newPage();
    
  // Screen size
  await page.setViewport({ width: 1680, height: 700 });
  await page.goto('https://maps.google.fr', {waitUntil: 'networkidle2'});

  // Execute functions
  await compFunctionExports.consentPage(page);
  await compFunctionExports.sendResearch(page, searchTerm);
  await page.waitForSelector("div.bfdHYd");
  let companies = [];
  // Scroll to the bottom
  await compFunctionExports.autoScroll(page, 'div.bfdHYd');
  companies = companies.concat(await compFunctionExports.parseCompany(page));
  // Sort grade by descending order
  await compFunctionExports.sortByWorst(companies);
  // Create csv
  // compFunctionExports.csvWriter(companies);
  // Show result
  console.log(companies);
  await browser.close();
  
  res.send(companies);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
