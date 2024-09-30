const ConsultarNotaCarioca = require('../lib/services/ConsultarNotaCarioca');
const getPathFromRoot = require('../lib/utils/getPathFromRoot');
const SoapHandler = require('../lib/utils/SoapHandler');

const rps = {
    Prestador: {
        Cnpj: '12123736000136',
        InscricaoMunicipal: '12345678'
    },
    PeriodoEmissao: {
        DataInicial: '2024-05-01',
        DataFinal: '2024-05-31'
    },
    Tomador: {
        CpfCnpj: {
            Cnpj: '98051666000173'
        }
    }
};

(async () => {

    const certPath = getPathFromRoot('certificado-teste.pfx');

    try {

        const cnc = new ConsultarNotaCarioca('dev', rps);

        const sh = new SoapHandler({ certPath: certPath, certPass: '123456' });

        const responseXML = await sh.send(cnc);

        console.log(responseXML);

        const responseJson = sh.convertXmlToJson(responseXML);

        const responseNota = sh.convertXmlToJson(responseJson['soap:Envelope']['soap:Body'][0].ConsultarNfsePorRpsResponse[0].outputXML);

        console.log(responseNota.ConsultarNfseResposta.CompNfse[0].Nfse[0].InfNfse);

        console.log('Nota consultada com sucesso!');


    } catch (e) {
        console.log(e)
    }

})();