const db = require('./db')

const Perdido = db.sequelize.define('Perdido',{
    IdAnimal:{
        type:db.Sequelize.INTEGER, 
        primaryKey:true
    },
    Estado:{
        type:db.Sequelize.STRING(2), 
        primaryKey:true
    },
    Cidade:{
        type:db.Sequelize.STRING(40), 
    },
    Bairro:{
        type:db.Sequelize.STRING(40), 
    },
    Rua:{
        type:db.Sequelize.STRING(50),
    },
    Numero:{
        type:db.Sequelize.INTEGER, 
    },
    Data:{
        type:db.Sequelize.DATE,
    },
},{
    freezeTableName: true,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
});

module.exports = Perdido