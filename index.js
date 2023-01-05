const puppeteer = require('puppeteer');  
compFunctionExports = require('./company_function');

/**
 * Récupération de la valeur de l'input
 */
function getValues(){
  var input = document.getElementById("input").value;
  alert(input);
}
const values = getValues();

(async () => {
    
    const browser = await puppeteer.launch(
      {
        userDataDir: ("./user_data"),
        headless: true,
      }
  );

    const page = await browser.newPage();
    // Full screen
    await page.setViewport({ width: 1680, height: 700 });
    await page.goto('https://maps.google.fr', {waitUntil: 'networkidle2'});

    console.log(values);
    // Execute functions
    await compFunctionExports.consentPage(page);
    await compFunctionExports.sendResearch(values);

    await page.waitForSelector("a.a4gq8e-aVTXAb-haAclf-jRmmHf-hSRGPd");

    let companies = [];

  
    // While there is new page, continue
    do {
      await compFunctionExports.autoScroll(page);
      companies = companies.concat(await compFunctionExports.parseCompany(page));
      console.log('Recherche en cours, nombre d\'entreprises trouvées actuellement ' + companies.length);
      await compFunctionExports.goToNextPage(page);  
    } while (await compFunctionExports.hasNextPage(page));

    // Sort grade by descending order
    await compFunctionExports.sortByWorst(companies);
    
    // Show result
    console.log(companies);

    await browser.close();
})();