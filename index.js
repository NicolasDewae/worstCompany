const puppeteer = require('puppeteer');  
compFunctionExports = require('./company_function');

(async () => {
    
  const browser = await puppeteer.launch(
    {
      userDataDir: ("./user_data"),
      headless: true,
    }
  );
    
  const page = await browser.newPage();
  // Screen size
  await page.setViewport({ width: 1680, height: 700 });
  await page.goto('https://maps.google.fr', {waitUntil: 'networkidle2'});

  // Execute functions
  await compFunctionExports.consentPage(page);
  await compFunctionExports.sendResearch(page);
  await page.waitForSelector("div.bfdHYd");
  let companies = [];
  // Scroll to the bottom
  await compFunctionExports.autoScroll(page, 'div.bfdHYd');
  companies = companies.concat(await compFunctionExports.parseCompany(page));
  // Sort grade by descending order
  await compFunctionExports.sortByWorst(companies);
  // Create csv
  compFunctionExports.csvWriter(companies);
  // Show result
  console.log(companies);
  await browser.close();
})();