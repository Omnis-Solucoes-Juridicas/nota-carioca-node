const CancelarNotaCarioca = require('./services/CancelarNotaCarioca');
const ConsultarNotaCarioca = require('./services/ConsultarNotaCarioca');
const ConsultarNotaCariocaRPS = require('./services/ConsultarNotaCariocaRPS');
const GerarNotaCarioca = require('./services/GerarNotaCarioca');

const SoapHandler = require('./utils/SoapHandler');

// Exporta as classes como parte do módulo
module.exports = {
    CancelarNotaCarioca,
    ConsultarNotaCarioca,
    ConsultarNotaCariocaRPS,
    GerarNotaCarioca,
    SoapHandler
};