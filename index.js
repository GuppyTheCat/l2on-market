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
  return iconv.decode(Buffer.from(buffer, 'binary'), 'cp1251');
}


function saveResult(buf, fileName = './test/test.html') {
  fs.outputFile(fileName, buf);
  return buf;
}

function showResult(res) {
  console.log(res);
  return res;
}

function getItems(html, itemType) {
  let $ = cheerio.load(html),
    content = '';
  switch (itemType) {
    case '0':
      for (itemType in FILTERS.type) {
        if (itemType !== 'all')
          content += $(`#group_${FILTERS.type[itemType]}`).html()
      }
      break;
    default:
      content = $(`#group_${FILTERS.type[itemType]}`).html()
      break;
  }
  return $('#content').html();
}

let options = {
  server: SERVERS.main.blackbird.id,
  type: 'armor',
  grade: 'D'
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