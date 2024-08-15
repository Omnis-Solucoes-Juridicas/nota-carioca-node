const ConsultarNotaCariocaRPS = require('../lib/services/ConsultarNotaCariocaRPS');
const SoapHandler = require('../lib/utils/SoapHandler');
const getPathFromRoot = require('../lib/utils/getPathFromRoot');

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

const certPath = getPathFromRoot('certificado-teste.pfx');

const cnc = new ConsultarNotaCariocaRPS('dev', rps);

const sh = new SoapHandler({ certPath: certPath, certPass: '123456' });

sh.send(cnc).then((response) => {
    console.log('sucesso: ', response);
}).catch((error) => {
    console.error('erro: ', error);
});