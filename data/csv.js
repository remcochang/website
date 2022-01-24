/*
 * Reads all .csv files in /data and exports them to Eleventy's global data
 * To access data in templates, use the filename as a global variable
 * e.g., given papers.csv:
 *
 * {% for paper in papers %}
 *   <p>{{ paper.title }}</p>
 * {% endfor %}
 */

const fs = require('fs/promises');

function processData(filename, data) {
  switch (filename) {
    case 'grants.csv':
      return data.slice(0, 11);
    case 'papers.csv':
      {
        return data.map((paper) => {
          const pubs = [
            { name: paper.pname1, url: paper.purl1 },
            { name: paper.pname2, url: paper.purl2 },
            { name: paper.pname3, url: paper.purl3 },
            { name: paper.pname4, url: paper.purl4 },
          ]
            .filter((p) => p.name && p.url)
            .map((p) => ({ ...p, url: p.url.includes('http') ? p.url : `publications/${p.url}` }));

          const iconPath = paper.image || 'paper-icon.jpg';
          return { ...paper, iconPath, pubs };
        });
      }
      break;
    default:
      return data;
  }
}

module.exports = async function () {
  const files = await fs.readdir('./data');
  const csvs = files.filter((f) => f.endsWith('.csv'));

  let data = {};

  for (let csv of csvs) {
    try {
      const file = await fs.readFile(`./data/${csv}`, 'utf-8');
      const lines = file.split('\n');
      const headers = lines[0].trim().split(',');
      let converted = [];

      for (let line of lines.slice(1)) {
        if (line) {
          const matches = [...line.matchAll(/"(.*?)",?|([^,]*?)(,|$)/g)];
          const values = matches.map((m) => [m[1], m[2]].join(''));
          let result = {};
          for (let i = 0; i < headers.length; i++) {
            result[headers[i]] = values[i];
          }
          converted.push(result);
        }
      }

      converted = processData(csv, converted);
      data[csv.slice(0, csv.indexOf('.csv'))] = converted;
    } catch (e) {
      console.error(`Error: Couldn't parse ${csv}`);
    }
  }

  return data;
};
