module.exports = {
    servers: {
        12: {
            name: 'Hatos',
            project: 'Main'
        },
        27: {
            name: 'Elcardia',
            project: 'Main'
        },
        45: {
            name: 'Blackbird',
            project: 'Main'
        },
        1092: {
            name: 'Gran Kain',
            project: 'Classic'
        },
        1094: {
            name: 'Shillien',
            project: 'Classic'
        },
        3501: {
            name: 'Crimson',
            project: 'Essence'
        },
        3502: {
            name: 'Scarlet',
            project: 'Essence'
        },
        3061: {
            name: 'Silver',
            project: 'Essence'
        },
        3062: {
            name: 'Emerald',
            project: 'Essence'
        }
    },

    filters: {
        type: {
            all: '0',
            weapon: 'weapon',
            armor: 'armor',
            jewel: 'jewel',
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
    },
    offersRegExp: {
        'Персонаж': /<td\sclass="nick">(?:<a\shref="http:\/\/l2on.net\/.*?"\sclass="nickname">(.*?)<\/a>)?(?:<span\s.*?>скрыто<\/span>\s<span\sclass="add">.*?<\/span>)?<\/td>/,
        'Цена': /<td\s.*?order="(\d+)">.*?<\/td>/,
        'Кол-во':/<td\s.*?order="(\d+)">.*?<\/td>/,
        'Мод.': /<td\sclass="right"\sorder="\d+">(?:(\+\d+))?(?:<span\sclass="add">—<\/span>)?<\/td>/,
        'Атрибуты': /<td\sorder="\d+">(?:<span\s?title=".*?">(.*?)<\/span>)?(?:<span\sclass="add">—<\/span>)?<\/td>/,
        'Замечен': /<td\s.*?order="(\d+)"><span>(?:.*?)<\/span><\/td>/,
        'Город': /<td\sclass="town">(?:<span\s.*?>скрыто<\/span>)?(.*?)?<\/td>/
    }
}