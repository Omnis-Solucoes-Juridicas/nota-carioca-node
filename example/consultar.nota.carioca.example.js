const ConsultarNotaCarioca = require('../lib/services/ConsultarNotaCarioca');
const SoapHandler = require('../lib/utils/SoapHandler');
const getPathFromRoot = require('../lib/utils/getPathFromRoot');

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

const certPath = getPathFromRoot('certificado-teste.pfx');

const cnc = new ConsultarNotaCarioca('dev', rps);

const sh = new SoapHandler({ certPath: certPath, certPass: '123456' });

sh.send(cnc).then((response) => {
    console.log('sucesso: ', response);
}).catch((error) => {
    console.error('erro: ', error);
});