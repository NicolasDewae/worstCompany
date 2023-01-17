> **Warning**
> ## After a Google update, worstCompany is functionnal again (11/01/2023). Have fun ! 

# WorstCompany

<p>To find the worst company for any of your research. You can get the name, the grade, the number of comment and the url.</p>
<p>the research are know available via https://maps.google.fr</p>

## Required
<p>You need to install Node. To check :</p>

```shell
node -v
```
<p>You need npm install:</p>

```shell
npm install
```

<p>You need puppeteer:</p>

```shell
npm install puppeteer
```

<p>If you want to generate csv file, you need CSV Writer:</p>

```shell
npm i csv-writer
```

And create a file "csv_files" in the root of the project

## How does it work

<p>Open terminal where is the project and push your research with command line arguments, example:</p> 

```shell
node index.js dentiste paris
```

<p>example of return :</p>
<img src="https://github.com/NicolasDewae/worstCompany/blob/master/result_example.PNG" alt="">



