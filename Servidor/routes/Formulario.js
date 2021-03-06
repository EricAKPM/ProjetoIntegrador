const express = require("express");
const router = express.Router();
const Cliente = require('../models/Cliente');
const Animal = require('../models/Animal');
const Perdido = require("../models/Perdido");
const TelefoneCliente = require('../models/TelefoneCliente');
const qr = require('qr-image');


/*
TODAS AS AÇÕES QUE ESTAO NESSE ARQUIVO É NECESSARIO ESTAR LOGADO
*/

//Visualizar o animal(modo logado)
router.get('/Animal/:AnimalId', (req, res)=>{
    const IdAnimal = parseInt(req.params.AnimalId);
    const IdCliente = parseInt(res.locals.user.dataValues.IdCliente);
    Animal.findOne({where:{IdAnimal:IdAnimal, IdCliente:IdCliente}}).then((ResultadoConsulta)=>{
        if(!ResultadoConsulta || !ResultadoConsulta.dataValues.Disponivel){
            res.render('NotFound', {layout: false});
        }
        if(req.query.device=="Mobile"){
            res.json(ResultadoConsulta.dataValues);
        } else{
            ResultadoConsulta.dataValues.logado=true
            res.render("MeuAnimal", ResultadoConsulta.dataValues);
        }
    }).catch((e)=>{
        res.render('NotFound', {layout: false});
    });
})

//Obter a imagem do QRCode da sua conta
router.get("/QRCode", (req, res)=>{
    try{
        const IdCliente = parseInt(res.locals.user.dataValues.IdCliente);
        Cliente.findByPk(IdCliente).then((ResultadoConsulta)=>{
            if(!ResultadoConsulta){
                res.render('NotFound', {layout: false});
            } else {
                ResultadoConsulta=ResultadoConsulta.dataValues.CodigoAcesso
                console.log(ResultadoConsulta)
                if(req.query.device=="Mobile"){
                    res.send(ResultadoConsulta)
                } else {
                    const url = "localhost:8001/Cliente/"+IdCliente+"?CodigoAcesso="+ResultadoConsulta;
                    const code = qr.image(url, {type:'png', margin:1, parse_url:true})
                    res.type('png')
                    code.pipe(res)
                }
            }
        }).catch((e)=>{
            res.send(e);
        });
    }catch(e){

    }
});

//logout
router.get("/logout", (req, res) => {
    try{
        console.log('deslogado')
        req.logout();
    }catch(e){
        console.log(e)
    }
    res.redirect("/");
});

//Visualizar e editar as informações
router.get('/MinhaConta', (req,res)=>{
    try{
        const IdCliente = parseInt(res.locals.user.dataValues.IdCliente);
        Cliente.findByPk(IdCliente).then((ResultadoConsulta)=>{
            if(!ResultadoConsulta){
                res.render('NotFound', {layout: false});
            } else {
                ResultadoConsulta=ResultadoConsulta.dataValues;
                TelefoneCliente.findAll({where:{idCliente:IdCliente}}).then((ResultadoConsultaTelefone)=>{
                    for(let i=0;i < ResultadoConsultaTelefone.length;i++){
                        if(ResultadoConsultaTelefone[i].dataValues.NumeroOrdem==1)
                        ResultadoConsulta.NumeroCelular1=ResultadoConsultaTelefone[i].Numero
                        if(ResultadoConsultaTelefone[i].dataValues.NumeroOrdem==2)
                        ResultadoConsulta.NumeroCelular2=ResultadoConsultaTelefone[i].Numero
                    }
                    
                    if(req.query.device=="Mobile"){
                        res.json(ResultadoConsulta);
                    } else{
                        console.log(ResultadoConsulta)
                        ResultadoConsulta.logado=true;
                        res.render("MinhaConta", ResultadoConsulta);
                    }
                }).catch((e)=>{
                    res.redirect('/');
                })
            }
        }).catch((e)=>{
            res.redirect('/');
        });
    }catch(e){

    }
});

//Visualizar a conta do usuario com todas as informações
router.get('/Conta',(req,res)=>{
    const IdCliente = parseInt(res.locals.user.dataValues.IdCliente);
    console.log(IdCliente)
    Cliente.findByPk(IdCliente).then((ResultadoConsulta)=>{
        if(!ResultadoConsulta || ResultadoConsulta.dataValues.Disponivel==0){
            res.render('NotFound', {layout: false});
        } else {
            ResultadoConsulta = ResultadoConsulta.dataValues
            TelefoneCliente.findAll({where:{IdCliente:IdCliente}}).then((ResultadoConsultaTelefone)=>{
                console.log(ResultadoConsultaTelefone)
                for(let i=0;i < ResultadoConsultaTelefone.length;i++){
                    console.log(i)
                    if(ResultadoConsultaTelefone[i].dataValues.NumeroOrdem==1)
                        ResultadoConsulta.NumeroCelular1=ResultadoConsultaTelefone[i].dataValues.Numero
                    if(ResultadoConsultaTelefone[i].dataValues.NumeroOrdem==2)
                        ResultadoConsulta.NumeroCelular2=ResultadoConsultaTelefone[i].dataValues.Numero
                }
                //ResultadoConsulta.TelaDaConta = true;
                /*if(!req.query.NumeroPagina || parseInt(req.query.NumeroPagina,10) < 0 || req.query.NumeroPagina===parseInt(req.query.NumeroPagina) 
                || !(!isNaN(req.query.NumeroPagina) && parseInt(Number(req.query.NumeroPagina)) == req.query.NumeroPagina && !isNaN(parseInt(req.query.NumeroPagina, 10)))){
                    console.log('\n\nERRO')
                    var NumeroPagina=1
                } else {
                    var NumeroPagina=parseInt(req.query.NumeroPagina)
                }*/
                console.log(ResultadoConsulta)
            }).catch((e)=>{
                console.log(e)
                res.send(e)
                //res.render('NotFound', {layout: false});
            })
            Animal.findAll({where:{IdCliente:IdCliente}/*,limit: 8, offset: 8*(NumeroPagina-1*/}).then((ResultadoConsultaAnimal)=>{
                if(ResultadoConsultaAnimal){
                    var AnimalObtidos=[];
                    for(var i=0;i < ResultadoConsultaAnimal.length;i++){
                        if(ResultadoConsultaAnimal[i].dataValues.Disponivel)
                            AnimalObtidos.push(ResultadoConsultaAnimal[i].dataValues)
                    }
                    ResultadoConsulta.AnimalCadastrados = AnimalObtidos;
                    if (req.user)
                        ResultadoConsulta.logado=true;
                    ResultadoConsulta.UsuarioNaPropriaConta=true
                    res.render("Conta", ResultadoConsulta);

                    /*Animal.findAndCountAll({where:{IdCliente:IdCliente},limit: 8, offset: 8*(NumeroPagina-1)}). then((QuantidadeAnimais)=>{ 
                        ResultadoConsulta.QuantidadeAnimais = QuantidadeAnimais.count;
                        if(req.query.device=="Mobile"){
                            res.json(ResultadoConsulta);
                        } else{
                            res.render("Cliente", ResultadoConsulta);
                        }
                    }).catch(()=>{

                    });*/
                } //else {
                    //ResultadoConsulta.QuantidadeAnimais = 0
                //}
            }).catch((e)=>{
                res.render('NotFound', {layout: false});
            })
        }
    }).catch((e)=>{
        res.render('NotFound', {layout: false});
    });
});

//ADICIONAR uma animal novo
router.post('/AdicionarAnimal', (req,res)=>{
    try{
        if(!Date.parse(req.body.DataNascimento))
            req.body.DataNascimento=null
    }catch(e){
        req.body.DataNascimento=null
    }
    try{
        Animal.create({
            idCliente:res.locals.user.dataValues.IdCliente,
            Especie:req.body.Especie,
            Raca:req.body.Raca,
            Nome:req.body.Nome,
            Cor:req.body.Cor,
            Porte:req.body.Porte,
            DataNascimento:req.body.DataNascimento,
            Disponivel:req.body.Disponivel,
        });
        res.redirect('/Formulario/Conta');
    }catch(e){

    }
});


/* -Continua no Projetointegrador 3-
router.post('/AdicionarAnimalLoja', (req,res)=>{
    try{
        Loja.findOne({where:{IdCliente:res.locals.user.dataValues.IdCliente, IdLoja:req.body.IdLoja}}).then((ResultadoConsulta)=>{
            if(ResultadoConsulta){
                AnimalLoja.create({
                    idCliente:res.locals.user.dataValues.IdCliente,
                    Especie:req.body.Especie,
                    Raca:req.body.Raca,
                    Nome:req.body.Nome,
                    Cor:req.body.Cor,
                    Porte:req.body.Porte,
                    Status:req.body.Status,
                    DataNascimento:req.body.DataNascimento,
                    Valor:req.body.Valor,
                });
            }
        }).catch((e)=>{
            console.log(e)
        });
    }catch(e){

    }  
});

router.post('/AdicionarLoja', (req,res)=>{
    try{
        Loja.create({
            IdCliente:res.locals.user.dataValues.IdCliente,
            CNPJ:req.body.CNPJ,
            Nome:req.body.Nome,
            Estado:req.body.Estado,
            Cidade:req.body.Cidade,
            Bairro:req.body.Bairro,
            Rua:req.body.Rua,
            Numero:req.body.Numero,
            Complemento:req.body.Complemento,
            Email:req.body.Email ,
            Descricao:req.body.Descricao,
        });
    }catch(e){

    }
});

router.post('/AdicionarProduto', (req,res)=>{
    try{
        Loja.findOne({where:{IdCliente:res.locals.user.dataValues.IdCliente, IdLoja:req.body.IdLoja}}).then((ResultadoConsulta)=>{
            if(ResultadoConsulta){
                Produto.create({
                    IdLoja:req.body.IdLoja,
                    Tipo:req.body.Tipo,
                    Fabricante:req.body.Fabricante,
                    Valor:req.body.Valor,
                    Nome:req.body.Nome,
                    Descricao:req.body.Descricao,
                });
            }
        }).catch((e)=>{
            console.log(e)
        });
    }catch(e){

    }  
});

router.post('/AdicionarServico', (req,res)=>{
    try{
        Loja.findOne({where:{IdCliente:res.locals.user.dataValues.IdCliente, IdLoja:req.body.IdLoja}}).then((ResultadoConsulta)=>{
            if(ResultadoConsulta){
                Servico.create({
                    IdLoja:req.body.IdLoja,
                    Tipo:req.body.Tipo,
                    Descricao:req.body.Descricao,
                    Valor:req.body.Valor,
                });
            }
        }).catch((e)=>{
            console.log(e)
        })
    }catch(e){

    }
});
*/


//salva os dados do cliente no banco de dados
router.post('/AlterarDadosCliente', (req, res)=>{
    const IdCliente = parseInt(res.locals.user.dataValues.IdCliente);
    console.log('ESTADO::::::::::::' + req.body.Estado)
    try{
        if(!Date.parse(req.body.DataNascimento))
            req.body.DataNascimento=null
        if(req.body.Estado=='null')
            req.body.Estado=null
    }catch(e){
        req.body.DataNascimento=null
    }
    Cliente.update({
        Nome:req.body.Nome,
        DataNascimento: req.body.DataNascimento,
        Estado:req.body.Estado,
        Cidade: req.body.Cidade,
        Bairro: req.body.Bairro,
        Rua: req.body.Rua,
        Numero: req.body.Numero,
        Complemento: req.body.Complemento,
        VisibilidadeNome: req.body.VisibilidadeNome,
        VisibilidadeEmail: req.body.VisibilidadeEmail,
        VisibilidadeNumeroCelular1:req.body.VisibilidadeNumeroCelular1,
        VisibilidadeNumeroCelular2:req.body.VisibilidadeNumeroCelular2,
        VisibilidadeDataNascimento: req.body.VisibilidadeDataNascimento,
        VisibilidadeEstado: req.body.VisibilidadeEstado,
        VisibilidadeCidade: req.body.VisibilidadeCidade,
        VisibilidadeBairro: req.body.VisibilidadeBairro,
        VisibilidadeRua: req.body.VisibilidadeRua,
        VisibilidadeNumero: req.body.VisibilidadeNumero,
        VisibilidadeComplemento: req.body.VisibilidadeComplemento
    }, {where:{idCliente:IdCliente}})
    res.redirect('/Formulario/Conta');
});

//Visualiza e altera os dados de uma animal
router.post('/AlterarDadosAnimal', (req,res)=>{
    try{
        if(!Date.parse(req.body.DataNascimento))
            req.body.DataNascimento=null
    }catch(e){
        req.body.DataNascimento=null
    }
    try{
        const IdCliente = parseInt(res.locals.user.dataValues.IdCliente);
        const IdAnimal = parseInt(req.body.IdAnimal);
        Animal.update({
            Especie:req.body.Especie,
            Raca:req.body.Raca,
            Nome:req.body.Nome,
            Cor:req.body.Cor,
            Porte:req.body.Porte,
            Status:req.body.Status,
            DataNascimento:req.body.DataNascimento,
        } , {where:{IdCliente:IdCliente, IdAnimal:IdAnimal}})
        res.redirect('/Formulario/Conta');
    }catch(e){
        console.log(e)
    }
});

/* -Continua no Projetointegrador 3-
router.post('/AlterarAnimalLoja', (req,res)=>{
    Loja.findOne({where:{IdCliente:res.locals.user.dataValues.IdCliente, IdLoja:req.body.IdLoja}}).then((ResultadoConsulta)=>{
        if(ResultadoConsulta){
            const AnimalLojaUpdate = AnimalLoja.create({IdLoja:req.body.IdLoja, IdAnimal:req.body.IdAnimal})
            if(AnimalLojaUpdate){
                AnimalLojaUpdate.update({
                    Especie:req.body.Especie,
                    Raca:req.body.Raca,
                    Nome:req.body.Nome,
                    Cor:req.body.Cor,
                    Porte:req.body.Porte,
                    Status:'Vende-se',
                    DataNascimento:req.body.DataNascimento,
                    Valor:req.body.Valor,
                });
            }
        }
    }).catch(()=>{

    })
});

router.post('/AlterarDadosLoja', (req,res)=>{
    try{
        const LojaUpdate = Loja.create({IdLoja:req.body.IdLoja, IdCliente:res.locals.user.dataValues.IdCliente})
        if(LojaUpdate){
            LojaUpdate.update({
                IdCliente:res.locals.user.dataValues.IdCliente,
                CNPJ:req.body.CNPJ,
                Nome:req.body.Nome,
                Estado:req.body.Estado,
                Cidade:req.body.Cidade,
                Bairro:req.body.Bairro,
                Rua:req.body.Rua,
                Numero:req.body.Numero,
                Complemento:req.body.Complemento,
                Email:req.body.Email ,
                Descricao:req.body.Descricao,
            });
        }
    }catch(e){

    }
});

router.post('/AlterarDadosProduto', (req,res)=>{
    try{
        const LojaCheck = Loja.create({IdLoja:req.body.IdLoja, IdCliente:res.locals.user.dataValues.IdCliente})
        if(LojaCheck){
            const ProdutoUpdate = Produto.create({IdProduto: req.body.IdProduto})
            if(ProdutoUpdate){
                ProdutoUpdate.update({
                    IdLoja:req.body.IdLoja,
                    Tipo:req.body.Tipo,
                    Fabricante:req.body.Fabricante,
                    Valor:req.body.Valor,
                    Nome:req.body.Nome,
                    Descricao:req.body.Descricao,
                });
            }
        }
    }catch(e){

    }
});

router.post('/AlterarDadosServico', (req,res)=>{
    try{
        const LojaCheck = Loja.create({IdLoja:req.body.IdLoja, IdCliente:res.locals.user.dataValues.IdCliente})
        if(LojaCheck){
            const ServicoUpdate = Produto.create({IdServico: req.body.IdServico})
            if(ServicoUpdate){
                ServicoUpdate.update({
                    IdLoja:req.body.IdLoja,
                    Tipo:req.body.Tipo,
                    Fabricante:req.body.Fabricante,
                    Valor:req.body.Valor,
                    Nome:req.body.Nome,
                    Descricao:req.body.Descricao,
                });
            }
        }
    }catch(e){

    }
});
*/


//Declara que um animal foi perdido, juntamente com o endereco que foi perdido
router.post('/AnimalPerdido',(req, res)=>{
    try{
        req.body.Recompensa = req.body.Recompensa.replace('.','')
        req.body.Recompensa = req.body.Recompensa.replace(",",".")
        req.body.Recompensa = req.body.Recompensa.substring(3)
        Animal.update(
            {Status:'Perdido'}
            ,{where:{IdAnimal:req.body.IdAnimal, IdCliente:res.locals.user.dataValues.IdCliente}})

        Perdido.create(
            {   IdAnimal:req.body.IdAnimal,
                Estado:req.body.Estado,
                Cidade:req.body.Cidade,
                Bairro:req.body.Bairro,
                Rua:req.body.Rua,
                Data:req.body.Data,
                Recompensa:req.body.Recompensa})
        res.redirect('/Formulario/Conta');
    }catch(e){

    }
});

//define que o animal perdido foi encontrado
router.post('/AnimalPadrao', (req, res)=>{
    try{
        Animal.update(
            {Status:'Padrao'}
            ,{where:{IdAnimal:req.body.IdAnimal, IdCliente:res.locals.user.dataValues.IdCliente}})
        
        Perdido.destroy({where:{IdAnimal:req.body.IdAnimal}})
        res.redirect('/Formulario/Conta');
    } catch(e){
        res.redirect('/Formulario/Conta');
    }
})

//Desativa a conta do usuario
router.post('/DesativarPerfilCliente',(req, res)=>{
    try{
        Cliente.update({Disponivel:0},{where:{IdCliente:res.locals.user.dataValues.IdCliente}})
        res.redirect('/Formulario/Conta');
        try{
            const IdCliente = parseInt(res.locals.user.dataValues.IdCliente);
            Animal.update({
                Disponivel:false
            }, {where:{IdCliente:IdCliente}})
            res.redirect('/Formulario/Conta');
        }catch(e){
            res.redirect('/Formulario/Conta');
        }
    } catch(e){

    }
});

//Desativa um animal pertencente a um usuario
router.post('/DesativarPerfilAnimal',(req,res)=>{
    try{
        const IdCliente = parseInt(res.locals.user.dataValues.IdCliente);
        Animal.update({
            Disponivel:false
        }, {where:{IdCliente:IdCliente, IdAnimal:req.body.IdAnimal}})
        res.redirect('/Formulario/Conta');
    }catch(e){
        console.log(e)
        res.redirect('/Formulario/Conta');
    }
});

/* -Continua no Projetointegrador 3-
router.post('/DesativarPerfilLoja',(req,res)=>{
    try{
        const LojaUpdate = Animal.create({IdLoja:req.body.IdLoja})
        if(LojaUpdate.IdCliente=res.locals.user.dataValues.IdCliente){
            LojaUpdate.update({
                Disponivel:false,
            })
        } else {
            res.send('Houve um erro')
        }
    }catch(e){

    }
});
*/

module.exports = router