const CancelarNota = require('../lib/services/CancelarNota');
const SoapHandler = require('../lib/utils/SoapHandler');
const getPathFromRoot = require('../lib/utils/getPathFromRoot');

const rps = {
    Pedido: {
        InfPedidoCancelamento:{
            IdentificacaoNfse: {
                Numero: '123456',
                Cnpj: '12345678901234',
                InscricaoMunicipal: '12345678',
                CodigoMunicipio: '12345678'
            },
            CodigoCancelamento: '1',
        },
        InscricaoMunicipal: '12345678'
    }
};

const certPath = getPathFromRoot('certificado-teste.pfx');

const cnc = new CancelarNota('dev', rps);

const sh = new SoapHandler({ certPath: certPath, certPass: '123456' });

sh.send(cnc).then((response) => {
    console.log('sucesso: ', response);
}).catch((error) => {
    console.error('erro: ', error);
});