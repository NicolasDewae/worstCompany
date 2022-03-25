const puppeteer = require('puppeteer');
compFunctionExports = require('./company_function');

const myArgs = process.argv.slice(2);

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

    // skip consent page if exist
    try {
      const [AcceptCookies] = await page.$x("//span[contains(., 'accepte')]");
      if (AcceptCookies) {
          await AcceptCookies.click();
          await page.waitForSelector("#searchbox");
          console.log("page de cookies accepée");
      } else {
        console.log("Il n'y a pas eu la page de cookies ");
        await page.waitForSelector("#searchbox");
      }
    } catch (error) {
      console.log("Une erreur c'est produite");      
      console.log("Pour plus de détails: " + error);
    }

    // send research
    try {
      // find input research by class
      const searchInput = await page.$("#searchbox");
      // insert keyword 
      for (let index = 0; index < myArgs.length; index++) {
        await searchInput.type(myArgs[index] + " "); 
      }
      // send research
      await page.click("#searchbox-searchbutton");
      console.log("La recherche est lancée");      
    } catch (error) {
      console.log("Une erreur c'est produite au moment de lancer la recherche");      
      console.log("Pour plus de détails: " + error);
    }

    await page.waitForSelector("a.a4gq8e-aVTXAb-haAclf-jRmmHf-hSRGPd");

    // Execute functions
    let companies = [];
    do {
      await compFunctionExports.autoScroll(page);
      companies = companies.concat(await compFunctionExports.parseCompany(page));
      console.log('Recherche en cours, nombre d\'entreprises trouvées actuellement ' + companies.length);
      await compFunctionExports.goToNextPage(page);  
    } while (await compFunctionExports.hasNextPage(page));
    
    // Sort by worst grade and return result
    try {
      companies.sort(function compare(a, b) {
        if (a.grade < b.grade) {
          return -1;          
        }
        if (a.grade > b.grade) {
          return 1;         
        }
        return 0;
      });
      // Final result
      console.table(companies);
    } catch (error) {
      console.log("Une erreur c'est produite au moment de traiter le tableau");
      console.log("Pour plus de détails: " + error);
    }

    await browser.close();


})();