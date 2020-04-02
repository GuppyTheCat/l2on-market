const fs = require('fs-extra')
const fetch = require('node-fetch')
const iconv = require('iconv-lite')
const cheerio = require('cheerio')
const { filters, servers } = require('./constants')

let parseUrl = 'http://l2on.net/?c=market&a=pulse&q=&type=0'

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

function htmlToJson(html) {
    /* return html.replace(/<tr>\s*<td.+?src=["'](.*?)["']><\/td>\s*<td.*?>\s*?<span.*?><a.*?["'](.*?)["'].*?>(.*?)<\/a>.*?<\/td>\s*?<td.*?data-i=["'](\d+)?["']>.*?alt=["'](.*?)["'].*?data-i=["'](\d*?)["'].*?<\/td><\/tr>/gi,
        '"$3":{"imgsrc":"http://l2on.net$1","link":"$2","name":"$3","price":$4,"grade":"$5","lastSeen":$6},') */
        /* return html.replace(/<tr>\s*<td\sclass=["']icon-cell["']><img\ssrc=["'](.*?)["']><\/td>\s*<td\sdata-i=["']\d+["']\sclass=["']item["']>\s*<span\sclass=["']l2item["']><a\shref=["'](.*?)["']\sdata-item=["']\d+["']>(.*?)<\/a><\/span><\/td>\s*<td\sclass=["'].+?["']\sdata-i=["']\d+["']>[\d\s]+?<\/td><td.+?data-i=["']\d+["']>.*?<\/td><td\sclass=["'].*?["']\sdata-i=["'](\d+)["']>.+?<\/td><\/tr>/gi,
        '"$3":{"imgsrc":"http://l2on.net$1","link":"$2","id":"$3","name":"$4","lastSeen":$5},') */
        return html.replace(/<tr>\s*<td\sclass=["']icon-cell["']><img\ssrc=["'](.*?)["']><\/td>\s*<td\sdata-i=["']\d+["']\sclass=["']item["']>\s*<span\sclass=["']l2item["']><a\shref=["'](.*?)["']\sdata-item=["'](\d+)\+?\d*["']>(.*?)<\/a>(\s<span class="add">.*?<\/span>)?(\s*<span\sclass=["']enchant["']>\+\d+<\/span>)?<\/span><\/td>\s*<td\sclass=["'].+?["']\sdata-i=["']\d+["']>[\d\s]+?<\/td><td.+?data-i=["']\d+["']>.*?<\/td><td\sclass=["'].*?["']\sdata-i=["'](\d+)["']>.+?<\/td><\/tr>/gi,
        '"$3":{"imgsrc":"http://l2on.net$1","link":"$2","id":"$3","name":"$4","lastSeen":$7},')
    }

function getItems(html) {
    let $ = cheerio.load(html, { decodeEntities: false }),
        items = []

    for (type in filters.type) {
        if (type !== 'all') {
            console.log(type)
            let content = $(`#group_${filters.type[type]}`).find('tbody').html()
            if (!content) continue
            content = htmlToJson(content)
            console.log(content.length + "\n");
            content = content.substring(0, content.length - 2)
            content = JSON.parse(`{${content}}`)
            content = JSON.stringify(content)
            items.push({ type, content })
        }
    }
    return items
}

function getMarketItems(serverId) {

    fetch(parseUrl, {
        headers: setHeaders(serverId)
    })
        .then(res => res.buffer())
        .then(res => decode(res))
        .then(res => getItems(res))
        .then(res => showResult(res))
        .then(res => saveResult(res))
        .catch(err => console.error('Что-то пошло не так: ', err));
}

module.exports = {
    getMarketItems
}