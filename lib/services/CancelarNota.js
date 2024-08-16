const xml2js = require('xml2js');
const Ajv = require('ajv');
const NotaCariocaBase = require('./NotaCariocaBase');
const sanitizeObjectKeys = require('../utils/sanitizeObjectKeys');

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

        let rps = {
            CancelarNfseEnvio: {
                Pedido: {
                    InfPedidoCancelamento: {
                        IdentificacaoNfse: {
                            Numero: this.rps.Pedido.InfPedidoCancelamento.IdentificacaoNfse.Numero,
                            Cnpj: this.rps.Pedido.InfPedidoCancelamento.IdentificacaoNfse.Cnpj,
                            InscricaoMunicipal: ( 
                                this.rps.Pedido.InfPedidoCancelamento.IdentificacaoNfse &&
                                this.rps.Pedido.InfPedidoCancelamento.IdentificacaoNfse.InscricaoMunicipal
                            ) ? this.rps.Pedido.InfPedidoCancelamento.IdentificacaoNfse.InscricaoMunicipal : '',
                            CodigoMunicipio: (
                                this.rps.Pedido.InfPedidoCancelamento.IdentificacaoNfse &&
                                this.rps.Pedido.InfPedidoCancelamento.IdentificacaoNfse.CodigoMunicipio
                            ) ? this.rps.Pedido.InfPedidoCancelamento.IdentificacaoNfse.CodigoMunicipio : '',
                        },
                        CodigoCancelamento: this.rps.Pedido.InfPedidoCancelamento.CodigoCancelamento,
                    },
                },
            },
        };

        // Validate array based on structure
        const validate = this.ajv.compile(structure);
        if (!validate(rps)) {
            throw new Error('Validation error: ' + JSON.stringify(validate.errors));
        }

        // Sanitize the object keys
        rps = sanitizeObjectKeys(rps);

        const xmlBuilder = new xml2js.Builder({ rootName: 'rootnode', xmldec: { version: '1.0', encoding: 'UTF-8' } });
        
        let xml;

        try {
            xml = xmlBuilder.buildObject(rps);
        } catch (error) {
            console.error('Erro ao construir o XML:', error.message);
            throw error;
        }

        // clean up encode tag added by encoder
        xml = xml.replace('<?xml version="1.0" encoding="UTF-8"?>', '');
        xml = xml.replace('<rootnode>', '');
        xml = xml.replace('</rootnode>', '');
        xml = xml.replace('<CancelarNfseEnvio>', '<CancelarNfseEnvio xmlns="http://www.abrasf.org.br/ABRASF/arquivos/nfse.xsd">');

        // Envelope request
        const content = this.addEnvelope(xml);

        console.log('Final XML to send: ', content);  // Log para verificação

        return content;
    }
}

module.exports = CancelarNota;