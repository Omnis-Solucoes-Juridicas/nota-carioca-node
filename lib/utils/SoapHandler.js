const axios = require('axios');
const fs = require('fs');
const https = require('https');
const forge = require('node-forge');
const tmp = require('tmp');
const xml2js = require('xml2js');

class SoapHandler {
    constructor(params) {
        if (!params.certPath) {
            throw new Error('cert_path missing.');
        }

        this.certPath = params.certPath;
        this.certPass = params.certPass || null;
        this.xmlParser = new xml2js.Parser();
    }

    async send(notaCariocaFactory) {
        const url = notaCariocaFactory.getEndpointUrl();
        const action = notaCariocaFactory.getAction();
        const xml = await notaCariocaFactory.getEnvelopeXml();
        const msgSize = Buffer.byteLength(xml, 'utf8');
        const headers = {
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': action,
            'Content-Length': msgSize,
        };

        // Generate temporary files for certificate and key
        const certTempFile = tmp.fileSync({ postfix: '.pem' });
        const keyTempFile = tmp.fileSync({ postfix: '.key' });

        try {
            const p12Buffer = fs.readFileSync(this.certPath);
            const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, this.certPass);

            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
            const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

            const cert = forge.pki.certificateToPem(certBags[forge.pki.oids.certBag][0].cert);
            const key = forge.pki.privateKeyToPem(keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key);

            fs.writeFileSync(certTempFile.name, cert);
            fs.writeFileSync(keyTempFile.name, key);

            const response = await axios.post(url, xml, {
                headers,
                timeout: 140000,
                httpsAgent: new https.Agent({
                    cert: fs.readFileSync(certTempFile.name),
                    key: fs.readFileSync(keyTempFile.name),
                    rejectUnauthorized: false,
                }),
            });

            return this.extractContentFromResponse(response.data);
        } catch (error) {
            if (error.response) {
                throw new Error(`HTTP error code: [${error.response.status}] - [${url}] - ${error.response.data}`);
            } else {
                throw new Error(`${error.message} [${url}]`);
            }
        } finally {
            certTempFile.removeCallback();
            keyTempFile.removeCallback();
        }
    }

    async isSuccess(responseXml) {
        const result = await this.xmlParser.parseStringPromise(responseXml);
        return !result.ListaMensagemRetorno;
    }

    async getErrors(responseXml) {
        const result = await this.xmlParser.parseStringPromise(responseXml);
        const errors = [];
        if (result.ListaMensagemRetorno) {
            const messages = result.ListaMensagemRetorno.MensagemRetorno;
            if (Array.isArray(messages)) {
                messages.forEach(msg => {
                    errors.push(`${msg.Codigo} - ${msg.Mensagem}`);
                });
            } else {
                errors.push(`${messages.Codigo} - ${messages.Mensagem}`);
            }
        }
        return errors;
    }

    extractContentFromResponse(response) {
        let resultXml;
        this.xmlParser.parseString(response, (err, result) => {
            if (err) throw new Error('Error parsing response XML: ' + err);
            if (result.outputXML) {
                resultXml = result.outputXML;
            } else {
                resultXml = response;
            }
        });
        return resultXml;
    }
}

module.exports = SoapHandler;
