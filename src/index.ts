/* eslint-disable @typescript-eslint/no-var-requires */
import * as _ from 'underscore'
import * as lookup from './lookup'

const continents = require('../data/continents')
const regions = require('../data/regions')
const countriesAll = require('../data/countries.json')
const currenciesAll = require('../data/currencies.json')
const languagesAll = require('../data/languages.json')

const getSymbol = require('currency-symbol-map')

exports.continents = continents
exports.regions = regions

exports.countries = {
    all: countriesAll,
}

_.each(countriesAll, function (country) {
    // prefer assigned country codes over inactive ones
    const exportedAlpha2 = exports.countries[country.alpha2]
    if (!exportedAlpha2 || exportedAlpha2.status === 'deleted') {
        exports.countries[country.alpha2] = country
    }

    const exportedAlpha3 = exports.countries[country.alpha3]
    if (!exportedAlpha3 || exportedAlpha3.status === 'deleted') {
        exports.countries[country.alpha3] = country
    }
})

exports.currencies = {
    all: currenciesAll,
}

_.each(currenciesAll, function (currency) {
    //If the symbol isn't available, default to the currency code
    let symbol = getSymbol(currency.code)
    if (symbol == '?') {
        symbol = currency.code
    }

    currency.symbol = symbol
    exports.currencies[currency.code] = currency
})

exports.languages = {
    all: languagesAll,
}

// Note that for the languages there are several entries with the same alpha3 -
// eg Dutch and Flemish. Not sure how to best deal with that - here whichever
// comes last wins.
_.each(languagesAll, function (language) {
    exports.languages[language.alpha2] = language
    exports.languages[language.bibliographic] = language
    exports.languages[language.alpha3] = language
})

exports.lookup = lookup({
    countries: countriesAll,
    currencies: currenciesAll,
    languages: languagesAll,
})

const callingCountries = { all: [] }

const callingCodesAll = _.reduce(
    countriesAll,
    function (codes, country) {
        if (country.countryCallingCodes && country.countryCallingCodes.length) {
            callingCountries.all.push(country)

            callingCountries[country.alpha2] = country
            callingCountries[country.alpha3] = country

            _.each(country.countryCallingCodes, function (code) {
                if (codes.indexOf(code) == -1) {
                    codes.push(code)
                }
            })
        }
        return codes
    },
    []
)

delete callingCountries[''] // remove empty alpha3s
exports.callingCountries = callingCountries

callingCodesAll.sort(function (a, b) {
    const parse = function (str) {
        return parseInt(str)
    }
    const splitA = _.map(a.split(' '), parse)
    const splitB = _.map(b.split(' '), parse)

    if (splitA[0] < splitB[0]) {
        return -1
    } else if (splitA[0] > splitB[0]) {
        return 1
    } else {
        // Same - check split[1]
        if (splitA[1] === undefined && splitB[1] !== undefined) {
            return -1
        } else if (splitA[1] !== undefined && splitB[1] === undefined) {
            return 1
        } else if (splitA[1] < splitB[1]) {
            return -1
        } else if (splitA[1] > splitB[1]) {
            return 1
        } else {
            return 0
        }
    }
})

exports.callingCodes = {
    all: callingCodesAll,
}
