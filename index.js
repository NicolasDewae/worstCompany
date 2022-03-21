const puppeteer = require('puppeteer');

(async () => {
    
    const browser = await puppeteer.launch(
      {
        userDataDir: ("./user_data"),
        headless: false,
      }
  );
    
    const page = await browser.newPage();
    // full screen
    await page.setViewport({ width: 1680, height: 700 });
    await page.goto('https://maps.google.fr', {waitUntil: 'networkidle2'});

    // skip consent page if exist
    const [AcceptCookies] = await page.$x("//span[contains(., 'accepte')]");
    if (AcceptCookies) {
        await AcceptCookies.click();
        await page.waitForSelector("#searchbox");
        console.log("page de cookies accepée");
    } else {
      console.log("Il n'y a pas eu la page de cookies ");
      await page.waitForSelector("#searchbox");
    }

    // send research
    try {
      // Create research
      const research = "coiffeur lille";
      // find input research by class
      const searchInput = await page.$("#searchbox");
      // insert keyword 
      await searchInput.type(research);
      // send research
      await page.click("#searchbox-searchbutton");
      console.log("La recherche " + research + " est lancée");      
    } catch (error) {
      console.log("une erreur c'est produite au moment de lancer la recherche, pour plus de détail " + error)      
    }

    await page.waitForSelector("a.a4gq8e-aVTXAb-haAclf-jRmmHf-hSRGPd");

    // Put names company in array
    async function parseTitle(page) {
      let titlesTab = [];
      
      const titles = await page.$$('.gm2-subtitle-alt-1 span');
      
      if (titles && titles.length) {
        for(const el of titles){
          const title = await el.evaluate(span => span.innerText);
          titlesTab.push({ title });
        }
      }

      return titlesTab;
    }


    const titles = await parseTitle(page);
    console.log(titles);

    await browser.close();


})();