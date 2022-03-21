const puppeteer = require('puppeteer');

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


    async function autoScroll(page){
      await page.evaluate(async () => {
          await new Promise((resolve, reject) => {
              var totalHeight = 0;
              var distance = 100;
              var timer = setInterval(() => {
                  const element = document.querySelectorAll('.section-scrollbox')[1];
                  var scrollHeight = element.scrollHeight;
                  totalHeight += distance;
  
                  if(totalHeight >= scrollHeight){
                      clearInterval(timer);
                      resolve();
                  }
              }, 100);
          });
      });
    }


    async function parseStars(page) {
      let worstTab = [];
      let starsTab = [];
      
      const stars = await page.$$('span.ZkP5Je span.MW4etd');
      
      if (stars && stars.length) {
        for(const el of stars){
          const star = await el.evaluate(span => span.innerHTML);
          const name = await el.evaluate(span => span.offsetParent.__cdn.Df.element.ariaLabel)
          // console.log(url);
          if (star[0] <= 2) {
            worstTab.push({ 
              name: name,
              star: star 
            });
          } else {
            starsTab.push({ 
              name: name,
              star: star
             });  
          }
        }
      }  

      return {
        worstTab,
        starsTab
      }
      
    }

    await autoScroll(page);

    const titles = await parseStars(page);
    console.log(titles);

    await browser.close();


})();