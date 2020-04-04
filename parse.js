const fs = require('fs-extra')
const fetch = require('node-fetch')
const iconv = require('iconv-lite')
const cheerio = require('cheerio')
const {
    filters,
    servers
} = require('./constants')

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
    /*<tr>\s*<td\sclass=["']icon-cell["']><img\ssrc=["'](.*?)["']><\/td>\s*<td\sdata-i=["']\d+["']\sclass=["']item["']>\s*<span\sclass=["']l2item["']><a\shref=["'](.*?)["']\sdata-item=["'](\d+)\+?\d*["']>(.*?)<\/a>(?:\s<span class="add">(.*?)<\/span>)?(?:\s*<span\sclass=["']enchant["']>(\+\d+)<\/span>)?(?:\s<span\sclass=["']attr["']\stitle=["'].+?["']>((?:<img\ssrc=["'].+?["']\salt=["'].+?["']>\s\d+\s*)+)<\/span>)?<\/span><\/td>\s*<td\sclass=["'].+?["']\sdata-i=["']\d+["']>[\d\s]+?<\/td><td.+?data-i=["']\d+["']>.*?<\/td>(?:<td\sclass=["'].*?["']\sdata-i=["']\d+["']><img src=["'].+?["']\sclass=["']grade["']\salt=["'](.+?)["']><\/td>)?<td\sclass=["'].*?["']\sdata-i=["'](\d+)["']>.+?<\/td><\/tr> */
    let reg = new RegExp(`<tr>\\s*<td\\sclass=["']icon-cell["']><img\\ssrc=["'](.*?)["']><\/td>\\s*<td\\sdata-i=["']\\d+["']\\sclass=["']item["']>\\s*<span\\sclass=["']l2item["']><a\\shref=["'](.*?)["']\\sdata-item=["'](\\d+)\+?\\d*["']>(.*?)<\/a>(?:\\s<span class="add">(.*?)<\/span>)?(?:\\s*<span\\sclass=["']enchant["']>(\+\\d+)<\/span>)?(?:\\s<span\\sclass=["']attr["']\\stitle=["'].+?["']>((?:<img\\ssrc=["'].+?["']\\salt=["'].+?["']>\\s\\d+\\s*)+)<\/span>)?<\/span><\/td>\\s*<td\\sclass=["'].+?["']\\sdata-i=["']\\d+["']>[\\d\\s]+?<\/td><td.+?data-i=["']\\d+["']>.*?<\/td>(?:<td\\sclass=["'].*?["']\\sdata-i=["']\\d+["']><img\\ssrc=["'].+?["']\\sclass=["']grade["']\\salt=["'](.+?)["']><\/td>)?<td\\sclass=["'].*?["']\\sdata-i=["'](\\d+)["']>.+?<\/td><\/tr>`, 'gi')
    let log = html.replace(reg, 'id:\t\t\t$3\nname:\t\t$4\nimg:\t\thttp://l2on.net$1\nlink:\t\t$2\nadd:\t\t$5\nenchant:\t\t$6\nattribute:\t\t$7\ngrade:\t\t$8\nlastSeen:\t\t$9\n--------------------------------------------------------------------------------\n')
    let output = html.replace(reg, '"$3":{"id":"$3","name":"$4","img":"http://l2on.net$1","link":"$2","add":"$5","enchant":"$6","attribute":"$7","grade":"$8","lastSeen":"$9"},')

    function formatOutputAttribute(input) {
        return input.replace(/"?<img\ssrc="\/img\/[\w_]+?\.png"\salt="(\w+?)">\s(\d+)\s?"?/gi, '{"$1":$2},')
                    .replace(/"attribute"\:((?:{.*?},)+),/gi, '"attribute":[$1],')
                    .replace(/("attribute"\:\[.+?),\]/gi, '$1]')
    }

    function formatLogAttribute(input) {
        return input.replace(/"?<img\ssrc="\/img\/[\w_]+?\.png"\salt="(\w+?)">\s(\d+)\s?"?/gi, '$1: $2,')
                    
    }
    log = formatLogAttribute(log)
    console.log(log)

    output = formatOutputAttribute(output)
    return output
}

function getItems(html) {
    let $ = cheerio.load(html, {
            decodeEntities: false
        }),
        items = []

    for (type in filters.type) {
        if (type !== 'all') {
            console.log(type)
            let content = $(`#group_${filters.type[type]}`).find('tbody').html()
            if (!content) continue
            content = htmlToJson(content)
            content = content.substring(0, content.length - 2)
            saveResult(`{${content}}`, fileName = './test/beforeParse.json')
            content = JSON.parse(`{${content}}`)
            content = JSON.stringify(content)
            items.push({
                type,
                content
            })
        }
    }
    console.log(items)
    return items
}

function getMarketItems(serverId) {

    fetch(parseUrl, {
            headers: setHeaders(serverId)
        })
        .then(res => res.buffer())
        .then(res => decode(res))
        .then(res => getItems(res))
        /* .then(res => showResult(res)) */
        .then(res => saveResult(res))
        .catch(err => console.error('Что-то пошло не так: ', err));
}

module.exports = {
    getMarketItems
}