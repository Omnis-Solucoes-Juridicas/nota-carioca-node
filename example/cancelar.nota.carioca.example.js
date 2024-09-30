const CancelarNota = require('../lib/services/CancelarNota');
const getPathFromRoot = require('../lib/utils/getPathFromRoot');
const SoapHandler = require('../lib/utils/SoapHandler');

const rps = {
    Pedido: {
        InfPedidoCancelamento: {
            IdentificacaoNfse: {
                Numero: '123456',
                Cnpj: '12345678901234',
                InscricaoMunicipal: '12345678',
                CodigoMunicipio: '12345678'
            },
            CodigoCancelamento: '1',
        },
    }
};

(async () => {

    const certPath = await getPathFromRoot('certificado-teste.pfx');

    try {

        const cnc = new CancelarNota('dev', rps);

        const sh = new SoapHandler({ certPath: certPath, certPass: '123456' });

        const responseXML = await sh.send(cnc);

        console.log(responseXML);

        const responseJson = sh.convertXmlToJson(responseXML);
        const responseNota = sh.convertXmlToJson(responseJson['soap:Envelope']['soap:Body'][0].CancelarNfseResponse[0].outputXML);

        console.log(responseNota.CancelarNfseResposta.Cancelamento[0].Confirmacao[0].DataHoraCancelamento);

        console.log('Nota cancelada com sucesso!');
    }
    catch (e) {
        console.log(e);
    }

})();