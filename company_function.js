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
 * @param {*} page 
 * @returns true if is the last company, false if not
 */
async function isLastCompany(page) {
  if (await page.$(".HlvSq") == null) {
    console.log('Scroll en cours...');
    return false;
  } 
  else {
    console.log('Scroll terminé');
    return true;
  }
}

/**
 * Scroll at the bottom
 * @param {*} page 
 */
exports.autoScroll = async function scrollPage(page, scrollElements) {
  let currentElement = 0;
  while (true) {
    let elementsLength = await page.evaluate((scrollElements) => {
      return document.querySelectorAll(scrollElements).length;
    }, scrollElements);
    for (; currentElement < elementsLength; currentElement++) {
      await page.waitForTimeout(200);
      await page.evaluate(
        (currentElement, scrollElements) => {
          document.querySelectorAll(scrollElements)[currentElement].scrollIntoView();
        },
        currentElement,
        scrollElements
      );
    }
    await page.waitForTimeout(5000);
    let newElementsLength = await page.evaluate((scrollElements) => {
      return document.querySelectorAll(scrollElements).length;
    }, scrollElements);
    if (newElementsLength === elementsLength) break;
    if (isLastCompany(page) == true) break;
  }
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
  let companies = [];      
  const lists = await page.$$('span.ZkP5Je');
  console.log("Nombre d'entreprises trouvées : " + lists.length);
  // Create tab
  if (lists && lists.length) {
    for(const el of lists){
      const name =    await el.evaluate(span => span.parentElement.parentElement.parentElement.parentElement.children[0].innerText);
      const grade =   await el.evaluate(span => span.children[0].innerHTML);
      const nbComm =  await el.evaluate(span => span.children[7].innerHTML);
      const adress =  await el.evaluate(span => span.parentElement.parentElement.parentElement.parentElement.parentElement.children[1].children[3].children[1].innerText);
      const url =     await el.evaluate(span => span.baseURI);
      companies.push({ 
          name: name,
          grade: grade,
          nbComm: nbComm,
          adress: adress,
          url: url
      });
    }
  }  
  return companies;
}

/**
 * Sort by worst grade
 * @param {*} companies 
 * @returns final tab
 */
exports.sortByWorst = async function sortByWorst(companies) {
    console.log("Tri des entreprises par note");
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