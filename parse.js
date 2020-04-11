const fs = require('fs-extra')
const fetch = require('node-fetch')
const iconv = require('iconv-lite')
const cheerio = require('cheerio')
const moment = require('moment')
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


function saveResult(buf, fileName = 'NewFile') {
    let date = moment().format('LTS').replace(/[\:\s]/g, '-')
    fileName = `./test/${fileName}_${date}.json`
    fs.outputFile(fileName, buf)
    return buf
}

function showResult(res) {
    console.log(res)
    return res
}

function htmlToJson(html) {
    /*<tr>\s*<td\sclass=["']icon-cell["']><img\ssrc=["'](.*?)["']><\/td>\s*<td\sdata-i=["']\d+["']\sclass=["']item["']>\s*<span\sclass=["']l2item["']><a\shref=["'](.*?)["']\sdata-item=["'](\d+)\+?\d*["']>(.*?)<\/a>(?:\s<span class="add">(.*?)<\/span>)?(?:\s*<span\sclass=["']enchant["']>(\+\d+)<\/span>)?(?:\s<span\sclass=["']attr["']\stitle=["'].+?["']>((?:<img\ssrc=["'].+?["']\salt=["'].+?["']>\s\d+\s*)+)<\/span>)?<\/span><\/td>\s*<td\sclass=["'].+?["']\sdata-i=["']\d+["']>[\d\s]+?<\/td><td.+?data-i=["']\d+["']>.*?<\/td>(?:<td\sclass=["'].*?["']\sdata-i=["']\d+["']><img src=["'].+?["']\sclass=["']grade["']\salt=["'](.+?)["']><\/td>)?<td\sclass=["'].*?["']\sdata-i=["'](\d+)["']>.+?<\/td><\/tr> */
    let reg = new RegExp(`<tr>\\s*<td\\sclass=["']icon-cell["']><img\\ssrc=["'](.*?)["']><\\/td>\\s*<td\\sdata-i=["']\\d+["']\\sclass=["']item["']>\\s*<span\\sclass=["']l2item["']><a\\shref=["'](.*?)["']\\sdata-item=["'](\\d+)\\+?\\d*["']>(.*?)<\\/a>(?:\\s<span class="add">(.*?)<\\/span>)?(?:\\s*<span\\sclass=["']enchant["']>(\\+\\d+)<\\/span>)?(?:\\s<span\\sclass=["']attr["']\\stitle=["'].+?["']>((?:<img\\ssrc=["'].+?["']\\salt=["'].+?["']>\\s\\d+\\s*)+)<\\/span>)?<\\/span><\\/td>\\s*<td\\sclass=["'].+?["']\\sdata-i=["']\\d+["']>[\\d\\s]+?<\\/td><td.+?data-i=["']\\d+["']>.*?<\\/td>(?:<td\\sclass=["'].*?["']\\sdata-i=["']\\d+["']><img\\ssrc=["'].+?["']\\sclass=["']grade["']\\salt=["'](.+?)["']><\\/td>)?<td\\sclass=["'].*?["']\\sdata-i=["'](\\d+)["']>.+?<\\/td><\\/tr>`, 'gi')
    let log = html.replace(reg, 'id:\t\t\t$3\nname:\t\t$4\nimg:\t\thttp://l2on.net$1\nlink:\t\t$2\nadd:\t\t$5\nenchant:\t\t$6\nattribute:\t\t$7\ngrade:\t\t$8\nlastSeen:\t\t$9\n--------------------------------------------------------------------------------\n')
    /* let output = html.replace(reg, '"$3":{"id":"$3","name":"$4","img":"http://l2on.net$1","link":"$2","add":"$5","enchant":"$6","attribute":"$7","grade":"$8","lastSeen":"$9"},') */
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
    /* console.log(log) */

    output = formatOutputAttribute(output)
    return output
}

function load(html) {
    return cheerio.load(html, {
        decodeEntities: false
    })
}

function getItems(html) {
    let $ = load(html)
    let items = []
    let log = ''
    for (type in filters.type) {
        if (type !== 'all') {

            log += `\n-----${type}-----\n`
            let content = $(`#group_${filters.type[type]}`).find('tbody').html()
            if (!content) continue
            content = htmlToJson(content)
            content = content.substring(0, content.length - 2)
            log += `{${content}}`
            content = JSON.parse(`{${content}}`)
            items.push({
                type,
                content
            })
            content = JSON.stringify(content)
        }
    }
    saveResult(log, `parseLog`)
    saveResult(JSON.stringify(items), `itemsLog`)
    return items
}

function getOffersHeaders($) {
    let headers = $('#group_sell').find('thead').html()
        .replace(/<tr>\s|\s<\/tr>/g, "")
        .replace(/<th.*?>(.*?)<\/th>\s*/g, "$1\n")
        .split("\n")
    headers.pop()
    headers.shift()
    /* console.log(headers) */
    return headers
}

function getOffersBodies($) {
    let offers = $('#group_sell').find('tbody').html()
        .match(/<tr\sclass=["']shop-(?:\d+).*?["']>\s(?:(?:.+\s)+?)<\/tr>/g)
    // console.log(offers)
    let result = []
    for (let offer of offers) {
        let offerId = offer.replace(/<tr\sclass=["']shop-(\d+).*?["']>\n(?:(?:.+\s)+?)<\/tr>/g, '$1')
        /* console.log(offerId) */
        let cells = offer.match(/<td.*>.*?<\/td>/g)
        /* console.log(cells) */
        result.push({
            offerId,
            cells
        })
    }
    return result
}

function getOffers(items, serverId) {
    let output= []
    for (let itemType = 0; itemType < items.length; itemType++) {
        console.log(items[itemType].type)

        output.push({itemType: items[itemType].type, items:{}})

        let offers = items[itemType].content

        /* console.log(offers) */

        for (let key in offers) {
            let offer = offers[key]
            /* console.log(offer.link) */

            output[itemType].items[key] = {itemId: offer.id, itemName: offer.name, offers : null}
            fetch(offer.link, {
                    headers: setHeaders(serverId)
                })
                .then(res => res.buffer())
                .then(res => decode(res))
                .then(res => {
                    let $ = load(res)
                    let headers = getOffersHeaders($)
                    let bodies = getOffersBodies($)
                    /* console.log(headers, bodies) */
                    let result = []
                    for (let item = 0; item < bodies.length; item++) {
                        result.push({
                            offerNum: bodies[item].offerId,
                            fields: []
                        })
                        for (let td = 0; td < bodies[item].cells.length; td++) {
                            let headerTitle = headers[td]
                            let tdInnerHtml = bodies[item].cells[td]
                            let cell
                            switch (headerTitle) {
                                case 'Персонаж':
                                    cell = tdInnerHtml.replace(/<td\sclass="nick">(?:<a\shref="http:\/\/l2on.net\/.*?"\sclass="nickname">(.*?)<\/a>)?(?:<span\s.*?>скрыто<\/span>\s<span\sclass="add">.*?<\/span>)?<\/td>/, '$1') ||
                                        'скрыто'
                                    break;

                                case 'Цена':
                                    cell = tdInnerHtml.replace(/<td\s.*?order="(\d+)">.*?<\/td>/, '$1')
                                    break;

                                case 'Мод.':
                                    cell = tdInnerHtml.replace(/<td\sclass="right"\sorder="\d+">(?:(\+\d+))?(?:<span\sclass="add">—<\/span>)?<\/td>/, '$1')
                                    break;

                                case 'Атрибуты':
                                    cell = tdInnerHtml.replace(/<td\sorder="\d+">(?:<span\s?title=".*?">(.*?)<\/span>)?(?:<span\sclass="add">—<\/span>)?<\/td>/, '$1')
                                    break;

                                case 'Замечен':
                                    cell = tdInnerHtml.replace(/<td\s.*?order="(\d+)"><span>(?:.*?)<\/span><\/td>/, '$1')
                                    break;

                                case 'Город':
                                    cell = tdInnerHtml.replace(/<td\sclass="town">(?:<span\s.*?>скрыто<\/span>)?(.*?)?<\/td>/, '$1') ||
                                        'скрыто'
                                    break;

                            }
                            result[item].fields.push({
                                title: headerTitle,
                                content: cell
                            })
                        }
                    }
                    /* console.log(output[itemType].items[key]) */
                    
                    output[itemType].items[key].offers = result
                    /* saveResult(JSON.stringify(result), `resultLog`) */
                })
                .catch(err => console.error('Что-то пошло не так: ', err));
        }
    }
    saveResult(JSON.stringify(output), `getOffersOutputLog`)
}

function getMarketItems(serverId) {
    let server = servers[serverId]

    fetch(parseUrl, {
            headers: setHeaders(serverId)
        })
        .then(res => res.buffer())
        .then(res => decode(res))
        .then(res => getItems(res))
        .then(res => getOffers(res, serverId))
        .then(console.log(`<${server.name} parsed>`))
        .catch(err => console.error('Что-то пошло не так: ', err));
}

module.exports = {
    getMarketItems
}