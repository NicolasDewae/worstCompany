const searchButton = document.getElementById('searchButton');
const searchTermInput = document.getElementById('searchTerm');
const resultsTable = document.getElementById('resultsTable').querySelector('tbody');
const url = 'http://localhost:3000/research';

searchButton.addEventListener('click', async () => {
  const searchTerm = searchTermInput.value.trim();

  // Show loader
  const loader = document.querySelector("#loader");
  loader.style.display = "flex";

  if (searchTerm.length > 0) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchTerm: searchTerm })
    })
    .then(data => {
        return data.json();
    })
    .catch(error => {
        console.error(error);
    });
    
    if (response) {
      loader.style.display = "none";
    }


    const companies = response;

    resultsTable.innerHTML = '';

    companies.forEach(company => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${company.name}</td>
        <td>${company.grade}</td>
        <td>${company.nbComm}</td>
        <td>${company.address}</td>
        <td><a href="${company.url}" target="_blank">Lien</a></td>
      `;
      resultsTable.appendChild(tr);
    });
  }
});
