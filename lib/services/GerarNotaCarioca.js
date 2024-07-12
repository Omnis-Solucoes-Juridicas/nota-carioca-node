const xml2js = require('xml2js');
const Ajv = require('ajv');
const NotaCariocaBase = require('./NotaCariocaBase');

class GerarNotaCarioca extends NotaCariocaBase {
    constructor(env = 'dev', rps = []) {
        super(env, rps);
        this.ajv = new Ajv();
    }

    getOperation() {
        return 'GerarNfse';
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
                InfRps: {
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
                        DataEmissao: { type: 'string' },
                        NaturezaOperacao: { type: 'string' },
                        RegimeEspecialTributacao: { type: 'string' },
                        OptanteSimplesNacional: { type: 'string' },
                        IncentivadorCultural: { type: 'string' },
                        Status: { type: 'string' },
                        RpsSubstituido: {
                            type: 'object',
                            properties: {
                                Numero: { type: 'string' },
                                Serie: { type: 'string' },
                                Tipo: { type: 'string' },
                            },
                        },
                        Servico: {
                            type: 'object',
                            properties: {
                                Valores: {
                                    type: 'object',
                                    properties: {
                                        ValorServicos: { type: 'string' },
                                        ValorDeducoes: { type: 'string' },
                                        ValorPis: { type: 'string' },
                                        ValorCofins: { type: 'string' },
                                        ValorInss: { type: 'string' },
                                        ValorIr: { type: 'string' },
                                        ValorCsll: { type: 'string' },
                                        IssRetido: { type: 'string' },
                                        ValorIss: { type: 'string' },
                                        OutrasRetencoes: { type: 'string' },
                                        Aliquota: { type: 'string' },
                                        DescontoIncondicionado: { type: 'string' },
                                        DescontoCondicionado: { type: 'string' },
                                    },
                                    required: ['ValorServicos', 'IssRetido'],
                                },
                                ItemListaServico: { type: 'string' },
                                CodigoTributacaoMunicipio: { type: 'string' },
                                Discriminacao: { type: 'string' },
                                CodigoMunicipio: { type: 'string' },
                            },
                            required: ['Valores', 'ItemListaServico', 'CodigoTributacaoMunicipio', 'Discriminacao', 'CodigoMunicipio'],
                        },
                        Tomador: {
                            type: 'object',
                            properties: {
                                IdentificacaoTomador: {
                                    type: 'object',
                                    properties: {
                                        CpfCnpj: {
                                            type: 'object',
                                            properties: {
                                                Cpf: { type: 'string' },
                                                Cnpj: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                                RazaoSocial: { type: 'string' },
                                Endereco: {
                                    type: 'object',
                                    properties: {
                                        Endereco: { type: 'string' },
                                        Numero: { type: 'string' },
                                        Complemento: { type: 'string' },
                                        Bairro: { type: 'string' },
                                        CodigoMunicipio: { type: 'string' },
                                        Uf: { type: 'string' },
                                        Cep: { type: 'string' },
                                    },
                                },
                            },
                        },
                        Prestador: {
                            type: 'object',
                            properties: {
                                Cnpj: { type: 'string' },
                                InscricaoMunicipal: { type: 'string' },
                            },
                            required: ['Cnpj'],
                        },
                        IntermediarioServico: {
                            type: 'object',
                            properties: {
                                CpfCnpj: {
                                    type: 'object',
                                    properties: {
                                        Cpf: { type: 'string' },
                                        Cnpj: { type: 'string' },
                                    },
                                },
                                RazaoSocial: { type: 'string' },
                                InscricaoMunicipal: { type: 'string' },
                            },
                        },
                        ConstrucaoCivil: {
                            type: 'object',
                            properties: {
                                CodigoObra: { type: 'string' },
                                Art: { type: 'string' },
                            },
                        },
                    },
                    required: ['IdentificacaoRps', 'DataEmissao', 'NaturezaOperacao', 'OptanteSimplesNacional', 'IncentivadorCultural', 'Status', 'Servico', 'Prestador', 'Tomador'],
                },
            },
        };
    }

    async getEnvelopeXml() {
        const structure = this.getSchemaStructure();

        const rps = {
            InfRps: {
                '@xmlns': 'http://www.abrasf.org.br/ABRASF/arquivos/nfse.xsd',
                '@Id': this.rps.IdentificacaoRps.Numero,
                IdentificacaoRps: this.rps.IdentificacaoRps,
                DataEmissao: this.rps.DataEmissao,
                NaturezaOperacao: this.rps.NaturezaOperacao,
                RegimeEspecialTributacao: this.rps.RegimeEspecialTributacao || null,
                OptanteSimplesNacional: this.rps.OptanteSimplesNacional,
                IncentivadorCultural: this.rps.IncentivadorCultural,
                Status: this.rps.Status,
                RpsSubstituido: this.rps.RpsSubstituido || null,
                Servico: {
                    Valores: this.rps.Servico.Valores,
                    ItemListaServico: this.rps.Servico.ItemListaServico,
                    CodigoTributacaoMunicipio: this.rps.Servico.CodigoTributacaoMunicipio,
                    Discriminacao: this.rps.Servico.Discriminacao,
                    CodigoMunicipio: this.rps.Servico.CodigoMunicipio,
                },
                Prestador: this.rps.Prestador,
                Tomador: this.rps.Tomador,
                IntermediarioServico: this.rps.IntermediarioServico || null,
                ConstrucaoCivil: this.rps.ConstrucaoCivil || null,
            },
        };

        // Validate array based on structure
        const validate = this.ajv.compile(structure);
        if (!validate(rps)) {
            throw new Error('Validation error: ' + JSON.stringify(validate.errors));
        }

        const xmlBuilder = new xml2js.Builder({ rootName: 'Rps', xmldec: { version: '1.0', encoding: 'UTF-8' } });
        let xml = xmlBuilder.buildObject(rps);

        // clean up encode tag added by encoder
        xml = xml.replace('<?xml version="1.0" encoding="UTF-8"?>', '');

        let content = `<GerarNfseEnvio xmlns="http://notacarioca.rio.gov.br/WSNacional/XSD/1/nfse_pcrj_v01.xsd">${xml}</GerarNfseEnvio>`;

        // Envelope request
        content = this.addEnvelope(content);

        return content;
    }
}

module.exports = GerarNotaCarioca;
