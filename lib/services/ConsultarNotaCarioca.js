const xml2js = require('xml2js');
const Ajv = require('ajv');
const NotaCariocaBase = require('./NotaCariocaBase');

function sanitizeObjectKeys(obj) {
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObjectKeys);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const sanitizedKey = key.replace(/[^a-zA-Z0-9_.-]/g, '');
            acc[sanitizedKey] = sanitizeObjectKeys(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}

class ConsultarNotaCarioca extends NotaCariocaBase {
    constructor(env = 'dev', rps = {}) {
        super(env, rps);
        this.ajv = new Ajv();
    }

    getOperation() {
        return 'ConsultarNfse';
    }

    formatSuccessResponse(responseXml) {
        const parser = new xml2js.Parser({ explicitArray: false });
        let resultArr;
        parser.parseString(responseXml, (err, result) => {
            if (err) throw new Error('Error parsing XML: ' + err);
            resultArr = result;
        });

        const responseArr = [];
        if (resultArr.ListaNfse && resultArr.ListaNfse.CompNfse) {
            const compNfse = Array.isArray(resultArr.ListaNfse.CompNfse)
                ? resultArr.ListaNfse.CompNfse
                : [resultArr.ListaNfse.CompNfse];
            compNfse.forEach((nfse) => {
                responseArr.push(nfse.Nfse ? nfse.Nfse.InfNfse : nfse.InfNfse);
            });
        }

        return responseArr;
    }

    getSchemaStructure() {
        return {
            type: 'object',
            properties: {
                ConsultarNfseEnvio: {
                    type: 'object',
                    properties: {
                        Prestador: {
                            type: 'object',
                            properties: {
                                Cnpj: { type: 'string' },
                                InscricaoMunicipal: { type: 'string' },
                            },
                            required: ['Cnpj', 'InscricaoMunicipal'],
                        },
                        PeriodoEmissao: {
                            type: 'object',
                            properties: {
                                DataInicial: { type: 'string' },
                                DataFinal: { type: 'string' },
                            },
                            required: ['DataInicial', 'DataFinal'],
                        },
                        Tomador: {
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
                    },
                    required: ['Prestador', 'PeriodoEmissao'],
                },
            },
        };
    }

    async getEnvelopeXml() {
        const structure = this.getSchemaStructure();

        let rps = {
            ConsultarNfseEnvio: {
                Prestador: this.rps.Prestador,
                PeriodoEmissao: this.rps.PeriodoEmissao,
                Tomador: this.rps.Tomador,
            },
        };

        // Validate array based on structure
        const validate = this.ajv.compile(structure);
        if (!validate(rps)) {
            throw new Error('Validation error: ' + JSON.stringify(validate.errors));
        }

        // Sanitize the object keys
        rps = sanitizeObjectKeys(rps);

        console.log('RPS Object: ', JSON.stringify(rps, null, 2));  // Log para verificação

        const xmlBuilder = new xml2js.Builder({ headless: true, renderOpts: { pretty: false } });
        let xml;
        try {
            xml = xmlBuilder.buildObject(rps);
        } catch (error) {
            console.error('Erro ao construir o XML:', error.message);
            throw error;
        }

        // Add the xmlns and schemaLocation attributes manually
        xml = xml.replace('<ConsultarNfseEnvio>', '<ConsultarNfseEnvio xmlns="http://www.abrasf.org.br/ABRASF/arquivos/nfse.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.abrasf.org.br/ABRASF/arquivos/nfse.xsd">');

        console.log('Generated XML: ', xml);  // Log para verificação

        let content = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                ${xml}
            </soap:Body>
        </soap:Envelope>`;

        console.log('Final XML to send: ', content);  // Log para verificação

        return content;
    }
}

module.exports = ConsultarNotaCarioca;
