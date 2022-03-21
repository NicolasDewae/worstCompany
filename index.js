const puppeteer = require('puppeteer');

const research = "coiffeur lille";
const gradeMax = 2;

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
              var distance = 300;
              var timer = setInterval(() => {
                  var element = document.querySelectorAll('.section-scrollbox')[1];
                  var scrollHeight = element.scrollHeight;
                  element.scrollBy(0, distance);
                  totalHeight += distance;
  
                  if(totalHeight >= scrollHeight){
                      clearInterval(timer);
                      resolve();
                  }
              }, 100);
          });
      });
    }

    // click on "next page" button
    async function goToNextPage(page) {
      await page.click('button[aria-label="Page suivante"]');
      await page.waitForNetworkIdle();
    }

    // search if is the last page
    async function hasNextPage(page) {
      const element = await page.$('button[aria-label="Page suivante"]');
      if (!element) {
        throw new Error('La page suivante n\'a pas était trouvée');
      }      
      const disabled = await page.evaluate((el) => el.getAttribute('disabled'), element);
      if (disabled) {
        console.log('Recherche terminée');
      }
      return !disabled;
    }

    // Find companies and create tab 
    async function parseCompany(page) {
      let worstTab = [];      
      const grades = await page.$$('span.ZkP5Je span.MW4etd');
      // Create tab
      if (grades && grades.length) {
        for(const el of grades){
          const grade = await el.evaluate(span => span.innerHTML);
          const name = await el.evaluate(span => span.offsetParent.__cdn.Df.element.ariaLabel);
          const url = await el.evaluate(span => span.offsetParent.__cdn.context.H.context[6]);
          // [0].offsetParent.__cdn.context.H.context[6]
          if (grade[0] <= gradeMax) {
            worstTab.push({ 
              name: name,
              grade: grade,
              url: url
            });
          }
        }
      }  
      return worstTab
    }

    // Execute functions
    let companies = [];
    do {
      await autoScroll(page);
      companies = companies.concat(await parseCompany(page));
      console.log('Recherche en cours');
      await goToNextPage(page);  
    } while (await hasNextPage(page));
    
    console.log(companies);

    await browser.close();


})();