const puppeteer = require('puppeteer');

(async () => {
    // insérer la recherche à executer dans google maps
    const research = "coiffeur lille";
    
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
        console.log("page de cookies accepée");
    } else {
      console.log("Il n'y a pas eu la page de cookies ");
    }

    try {
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

    async function parseStars(page) {
      let starsTab = [];
      
      const stars = await page.$$('.MW4etd span');
      
      if (stars && stars.length) {
        for(const el of stars){
          const star = await el.evaluate(span => span.innerText);
          starsTab.push({ star });
        }
      }  

      return starsTab;
    }


    const titles = await parseTitle(page);
    console.log(titles);
    const stars = await parseStars(page);
    console.log(stars);

    // console.log('before waiting');
    // await page.evaluate(async() => {
    //   await new Promise(function(resolve) { 
    //          setTimeout(resolve, 10000);
    //   });
    // });
    // console.log('after waiting');


    //  // Mettre les éléments dans le tableau
    //  keyWord.push({
    //    title: element.querySelector("h1"),
    //    phone: element.querySelector("div.QSFF4-text gm2-body-2")
    //  });

    await browser.close();


})();