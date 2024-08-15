const GerarNotaCarioca = require('../lib/services/GerarNotaCarioca');
const SoapHandler = require('../lib/utils/SoapHandler');
const getPathFromRoot = require('../lib/utils/getPathFromRoot');

const rps = {
    IdentificacaoRps: {
        Numero: '1',
        Serie: 'ABC',
        Tipo: '1'
    },
    DataEmissao: '2024-05-01',
    NaturezaOperacao: '1',
    OptanteSimplesNacional: '1',
    IncentivadorCultural: '2',
    Status: '1',
    Servico: {
        Valores: {
            ValorServicos: '100.00',
            IssRetido: '2.00',
        },
        ItemListaServico: '1.07',
        CodigoTributacaoMunicipio: '522310000',
        Discriminacao: 'Teste de emissão de nota fiscal',
        CodigoMunicipio: '3304557',
    },
    Prestador: {
        Cnpj: '12123736000136',
        InscricaoMunicipal: '12345678'
    },
    Tomador: {
        CpfCnpj: {
            Cnpj: '98051666000173'
        }
    }
};

const certPath = getPathFromRoot('certificado-teste.pfx');

const cnc = new GerarNotaCarioca('dev', rps);

const sh = new SoapHandler({ certPath: certPath, certPass: '123456' });

sh.send(cnc).then((response) => {
    console.log('sucesso: ', response);
}).catch((error) => {
    console.error('erro: ', error);
});