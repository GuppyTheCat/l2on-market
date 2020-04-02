const fs = require('fs-extra');
const fetch = require('node-fetch');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');


let url = 'http://l2on.net/?c=market&a=pulse&q=&type=0';

const SERVERS = {
  classic: {
    gran_kain: {
      title: 'Gran Kain',
      id: '1092'
    },
    shillien: {
      title: 'Shillien',
      id: '1094'
    }
  },
  main: {
    blackbird: {
      title: 'Blackbird',
      id: '45'
    },
    elcardia: {
      title: 'Elcardia',
      id: '27'
    },
    hatos: {
      title: 'Hatos',
      id: '12'
    }
  },
  essence: {
    silver: {
      title: 'Silver',
      id: '3061'
    },
    emerald: {
      title: 'Emerald',
      id: '3062'
    },
    crimson: {
      title: 'Crimson',
      id: '3501'
    },
    scarlet: {
      title: 'Scarlet',
      id: '3502'
    }
  }
}

const FILTERS = {
  type: {
    all: '0',
    weapon: 'weapon',
    armor: 'armor',
    jewelry: 'jewel',
    recipe: 'recipe',
    book: 'book',
    other: 'other'
  },
  grade: {
    all: '0',
    D: 'D',
    C: 'C',
    B: 'B',
    A: 'A',
    S: 'S',
    S80: 'S80',
    R: 'R',
    R95: 'R95',
    R99: 'R99',
    R110: 'R110'
  }
}

function setFilters(itemType, itemGrade) {
  const type = FILTERS.type[itemType],
    grade = FILTERS.grade[itemGrade];

  url = `http://l2on.net/?c=market&a=pulse&q=&type=${type}&grade=${grade}`;
  console.log(url);
  return url;
}

function setHeaders(serverId) {
  return {
    'Cookie': `world=${serverId}`
  }
}

function decode(buffer) {
  return iconv.decode(Buffer.from(buffer, 'binary'), 'cp1251')
}


function saveResult(buf, fileName = './test/test.json') {
  fs.outputFile(fileName, buf);
  return buf;
}

function showResult(res) {
  console.log(res);
  return res;
}

function getItems(html, itemType) {
  let $ = cheerio.load(html, { decodeEntities: false }),
    content = '';
  switch (itemType) {
    case '0':
      for (type in FILTERS.type) {
        if (type !== 'all')
          content += $(`#group_${FILTERS.type[type]}`).find('tbody').html()
      }
      break;
    default:
      content = $(`#group_${FILTERS.type[itemType]}`).find('tbody').html()
      break;
  }
  let parsed = content.replace(/<tr>\s*<td.+?src=["'](.*?)["']><\/td>\s*<td.*?>\s*?<span.*?><a.*?["'](.*?)["'].*?>(.*?)<\/a>.*?<\/td>\s*?<td.*?data-i=["'](\d+)?["']>.*?alt=["'](.*?)["'].*?data-i=["'](\d*?)["'].*?<\/td><\/tr>/gi,
  '"$3":{"imgsrc":"http://l2on.net$1","link":"$2","name":"$3","price":$4,"grade":"$5","lastSeen":$6},')
  parsed = parsed.substring(0, parsed.length - 2)
  parsed = JSON.parse(`{${parsed}}`)
  console.log(parsed)
  return JSON.stringify(parsed)
}

let options = {
  server: SERVERS.classic.shillien.id,
  type: 'weapon',
  grade: 'B'
}

setFilters(options.type, options.grade);

fetch(url, {
    headers: setHeaders(options.server)
  })
  .then(res => res.buffer())
  .then(res => decode(res))
  .then(res => getItems(res, options.type))
  .then(res => saveResult(res))
  .catch(err => console.error('Что-то пошло не так: ', err));