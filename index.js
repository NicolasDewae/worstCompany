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
    // full screen
    await page.setViewport({ width: 1680, height: 700 });
    await page.goto('https://maps.google.fr', {waitUntil: 'networkidle2'});


    // Execute functions
    await compFunctionExports.consentPage(page);
    await compFunctionExports.sendResearch(page);

    await page.waitForSelector("a.a4gq8e-aVTXAb-haAclf-jRmmHf-hSRGPd");

    let companies = [];

    do {
      await compFunctionExports.autoScroll(page);
      companies = companies.concat(await compFunctionExports.parseCompany(page));
      console.log('Recherche en cours, nombre d\'entreprises trouvées actuellement ' + companies.length);
      await compFunctionExports.goToNextPage(page);  
    } while (await compFunctionExports.hasNextPage(page));

    await compFunctionExports.sortByWorst(companies);
    
    console.log(companies);

    await browser.close();
})();