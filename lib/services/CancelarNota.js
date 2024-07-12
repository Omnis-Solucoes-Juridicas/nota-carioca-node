const xml2js = require('xml2js');
const Ajv = require('ajv');
const NotaCariocaBase = require('../NotaCariocaBase');

class CancelarNota extends NotaCariocaBase {
    constructor(env = 'dev', rps = []) {
        super(env, rps);
        this.ajv = new Ajv();
    }

    getOperation() {
        return 'CancelarNfse';
    }

    formatSuccessResponse(responseXml) {
        const parser = new xml2js.Parser({ explicitArray: false });
        let resp;
        parser.parseString(responseXml, (err, result) => {
            if (err) throw new Error('Error parsing XML: ' + err);
            resp = result;
        });

        if (resp.Cancelamento && resp.Cancelamento.Confirmacao) {
            return {
                DataHoraCancelamento: resp.Cancelamento.Confirmacao.DataHoraCancelamento,
                Pedido: resp.Cancelamento.Confirmacao['@Id'],
            };
        }

        return [];
    }

    getSchemaStructure() {
        return {
            type: 'object',
            properties: {
                CancelarNfseEnvio: {
                    type: 'object',
                    properties: {
                        Pedido: {
                            type: 'object',
                            properties: {
                                InfPedidoCancelamento: {
                                    type: 'object',
                                    properties: {
                                        IdentificacaoNfse: {
                                            type: 'object',
                                            properties: {
                                                Numero: { type: 'string' },
                                                Cnpj: { type: 'string' },
                                                InscricaoMunicipal: { type: 'string' },
                                                CodigoMunicipio: { type: 'string' },
                                            },
                                            required: ['Numero', 'Cnpj', 'InscricaoMunicipal', 'CodigoMunicipio'],
                                        },
                                        CodigoCancelamento: { type: 'string' },
                                    },
                                    required: ['IdentificacaoNfse', 'CodigoCancelamento'],
                                },
                            },
                            required: ['InfPedidoCancelamento'],
                        },
                    },
                    required: ['Pedido'],
                },
            },
        };
    }

    async getEnvelopeXml() {
        const structure = this.getSchemaStructure();

        const rps = {
            CancelarNfseEnvio: {
                '@xmlns': 'http://www.abrasf.org.br/ABRASF/arquivos/nfse.xsd',
                Pedido: {
                    '@xmlns': 'http://www.abrasf.org.br/ABRASF/arquivos/nfse.xsd',
                    InfPedidoCancelamento: {
                        IdentificacaoNfse: this.rps.IdentificacaoNfse,
                        CodigoCancelamento: this.rps.CodigoCancelamento,
                    },
                },
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

        let content = `<CancelarNfseEnvio xmlns="http://notacarioca.rio.gov.br/WSNacional/XSD/1/nfse_pcrj_v01.xsd">${xml}</CancelarNfseEnvio>`;

        // Envelope request
        content = this.addEnvelope(content);

        return content;
    }
}

module.exports = CancelarNota;