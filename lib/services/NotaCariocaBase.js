const xml2js = require('xml2js');

class NotaCariocaBase {
    static BASE_ACTION_URL = 'http://notacarioca.rio.gov.br/';

    constructor(env = 'dev', rps = []) {
        this.rps = rps;
        this.env = env;
        this.encoder = new xml2js.Builder();
    }

    setRps(rps) {
        this.rps = rps;
    }

    setEnv(env) {
        this.env = env;
    }

    getEnv() {
        return this.env;
    }

    getEndpointUrl() {
        const subdomain = this.env !== 'prod' ? 'notacariocahom' : 'notacarioca';
        return `https://${subdomain}.rio.gov.br/WSNacional/nfse.asmx`;
    }

    getAction() {
        return `${NotaCariocaBase.BASE_ACTION_URL}${this.getOperation()}`;
    }

    getEncoder() {
        return this.encoder;
    }

    addEnvelope(content) {
        const actionRequest = `${this.getOperation()}Request`;

        const env = `
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <${actionRequest} xmlns="http://notacarioca.rio.gov.br/">
            <inputXML>
              <![CDATA[
                PLACEHOLDER
              ]]>
            </inputXML>
          </${actionRequest}>
        </soap:Body>
      </soap:Envelope>`;

        return env.replace('PLACEHOLDER', content);
    }

    // Placeholder for the getOperation method, should be implemented by subclasses
    getOperation() {
        throw new Error('You have to implement the method getOperation!');
    }
}

module.exports = NotaCariocaBase;
