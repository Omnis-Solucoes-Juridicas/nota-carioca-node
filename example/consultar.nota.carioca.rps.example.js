const ConsultarNotaCariocaRPS = require('../lib/services/ConsultarNotaCariocaRPS');
const getPathFromRoot = require('../lib/utils/getPathFromRoot');
const SoapHandler = require('../lib/utils/SoapHandler');

const rps = {
    IdentificacaoRps: {
        Numero: '1',
        Serie: 'ABC',
        Tipo: '1'
    },
    Prestador: {
        Cnpj: '12123736000136',
        InscricaoMunicipal: '12345678'
    }
};

(async () => {

    const certPath = await getPathFromRoot('certificado-teste.pfx');

    try {
        const cnc = new ConsultarNotaCariocaRPS('dev', rps);

        const sh = new SoapHandler({ certPath: certPath, certPass: '123456' });

        const responseXML = await sh.send(cnc);

        console.log(responseXML);

        const responseJson = sh.convertXmlToJson(responseXML);

        const responseNota = sh.convertXmlToJson(responseJson['soap:Envelope']['soap:Body'][0].ConsultarNfsePorRpsResponse[0].outputXML);

        console.log(responseNota.ConsultarNfseRpsResposta.CompNfse[0].Nfse[0].InfNfse);

        console.log('Nota consultada por RPS com sucesso!');

    } catch (e) {
        console.log(e)
    }

})();