const Ajv = require('ajv');
const xml2js = require('xml2js');

const NotaCariocaBase = require('../NotaCariocaBase');

class ConsultarNotaCariocaRPS extends NotaCariocaBase {
    constructor(env = 'dev', rps = []) {
        super(env, rps);
        this.ajv = new Ajv();
    }

    getOperation() {
        return 'ConsultarNfsePorRps';
    }

    formatSuccessResponse(responseXml) {
        const parser = new xml2js.Parser({ explicitArray: false });
        let resultArr;
        parser.parseString(responseXml, (err, result) => {
            if (err) throw new Error('Error parsing XML: ' + err);
            resultArr = result;
        });

        return {
            nfse: resultArr.CompNfse.Nfse.InfNfse,
        };
    }

    getSchemaStructure() {
        return {
            type: 'object',
            properties: {
                ConsultarNfseRpsEnvio: {
                    type: 'object',
                    properties: {
                        IdentificacaoRps: {
                            type: 'object',
                            properties: {
                                Numero: { type: 'string' },
                                Serie: { type: 'string' },
                                Tipo: { type: 'string' },
                            },
                            required: ['Numero', 'Serie', 'Tipo'],
                        },
                        Prestador: {
                            type: 'object',
                            properties: {
                                Cnpj: { type: 'string' },
                                InscricaoMunicipal: { type: 'string' },
                            },
                            required: ['Cnpj', 'InscricaoMunicipal'],
                        },
                    },
                    required: ['IdentificacaoRps', 'Prestador'],
                },
            },
        };
    }

    async getEnvelopeXml() {
        const structure = this.getSchemaStructure();

        const rps = {
            ConsultarNfseRpsEnvio: {
                '@xmlns': 'http://www.abrasf.org.br/ABRASF/arquivos/nfse.xsd',
                IdentificacaoRps: this.rps.IdentificacaoRps,
                Prestador: this.rps.Prestador,
            },
        };

        // Validate array based on structure
        const validate = this.ajv.compile(structure);
        if (!validate(rps)) {
            throw new Error('Validation error: ' + JSON.stringify(validate.errors));
        }

        const xmlBuilder = new xml2js.Builder({ rootName: 'rootnode', xmldec: { version: '1.0', encoding: 'UTF-8' } });
        let xml = xmlBuilder.buildObject(rps);

        // clean up encode tag added by encoder
        xml = xml.replace('<?xml version="1.0" encoding="UTF-8"?>', '');
        xml = xml.replace('<rootnode>', '');
        xml = xml.replace('</rootnode>', '');

        let content = `<ConsultarNfsePorRpsEnvio xmlns="http://notacarioca.rio.gov.br/WSNacional/XSD/1/nfse_pcrj_v01.xsd">${xml}</ConsultarNfsePorRpsEnvio>`;

        // Envelope request
        content = this.addEnvelope(content);

        return content;
    }
}

module.exports = ConsultarNotaCariocaRPS;
