/**
 * Skip consent page if exist
 * @param {*} page 
 */
exports.consentPage = async function consentPage(page) {
    const [AcceptCookies] = await page.$x("//span[contains(., 'accepte')]");
    
    if (AcceptCookies) {
        await AcceptCookies.click();
        console.log("page de cookies accepée");
        await page.waitForSelector("#searchbox");
    } else {
      console.log("Il n'y a pas eu la page de cookies ");
      await page.waitForSelector("#searchbox");
    }
}

/**
 * Find research input and send arguments
 * @param {*} page 
 */
exports.sendResearch = async function sendResearch(page) {
  // Get arguments
  const myArgs = process.argv.slice(2);
    // Find input research by id
    const searchInput = await page.$("#searchbox");
    // Insert keyword 
    for (let index = 0; index < myArgs.length; index++) {
      await searchInput.type(myArgs[index] + " "); 
    }
    // Send research
    await page.click("#searchbox-searchbutton");
    console.log("La recherche est lancée");      
}

/**
 * Scroll at the bottom
 * @param {*} page 
 */
exports.autoScroll = async function autoScroll(page){
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

  /**
   * Click on "next page" button
   * @param {*} page 
   */
  exports.goToNextPage = async function goToNextPage(page) {
    await page.click('button[aria-label="Page suivante"]');
    await page.waitForNetworkIdle();
  }

  /**
   * Search if is the last page
   * @param {*} page 
   * @returns !disabled
   */
  exports.hasNextPage = async function hasNextPage(page) {
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

  /**
   * Find companies and create tab
   * @param {*} page 
   * @returns tab with companies
   */
  exports.parseCompany = async function parseCompany(page) {
    let worstTab = [];      
    const grades = await page.$$('span.ZkP5Je span.MW4etd');
    // Create tab
    if (grades && grades.length) {
      for(const el of grades){
        const name = await el.evaluate(span => span.offsetParent.__cdn.Df.element.ariaLabel);
        const grade = await el.evaluate(span => span.innerHTML);
        const nbComm = await el.evaluate(span => span.parentElement.lastChild.innerText);
        // const adress = await el.evaluate(span => span.parentElement.parentElement.parentElement.parentNode.parentNode.lastElementChild.children[1].outerText);
        const url = await el.evaluate(span => span.offsetParent.__cdn.context.H.context[6]);
        worstTab.push({ 
            name: name,
            grade: grade,
            nbComm: nbComm,
            // adress: adress,
            url: url
        });
      }
    }  
    return worstTab
  }

  /**
   * Sort by worst grade
   * @param {*} companies 
   * @returns final tab
   */
  exports.sortByWorst = async function sortByWorst(companies) {
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
      return companies; 
  }