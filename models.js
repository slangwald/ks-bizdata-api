const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://localhost:5432/ks_biz', {logging: false}) // Example for postgres
const Model = Sequelize.Model;

class Url extends Model {
}

Url.init({
    url: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    status: {
        type: Sequelize.ENUM,
        values: ['TO_FETCH', 'PROCESSED', 'FAILED']
    }
}, {
    sequelize,
    modelName: 'url',
    underscored: true
});

class Business extends Model {
}

Business.init({
    businessName: {type: Sequelize.STRING},
    tradeName: {type: Sequelize.STRING},
    typeOfBusiness: {type: Sequelize.STRING},
    uniqueId: {type: Sequelize.STRING, primaryKey: true},
    businessNumber: {type: Sequelize.STRING},
    fiscalNumber: {type: Sequelize.STRING},
    takCertificationNumber: {type: Sequelize.STRING},
    numberOfEmployees: {type: Sequelize.STRING},
    registrationDate: {type: Sequelize.STRING},
    municipality: {type: Sequelize.STRING},
    address: {type: Sequelize.STRING},
    phoneNumber: {type: Sequelize.STRING},
    email: {type: Sequelize.STRING},
    capital: {type: Sequelize.STRING},
    statusInKbra: {type: Sequelize.STRING},
    statusInTak: {type: Sequelize.STRING},
    registryUrl: {type: Sequelize.STRING, unique: true},
}, {
    sequelize,
    modelName: 'business',
    underscored: true
});

class AuthorizedPeople extends Model {
}

AuthorizedPeople.init({
    firstName: {type: Sequelize.STRING},
    lastName: {type: Sequelize.STRING},
    position: {type: Sequelize.STRING},
    authorizations: {type: Sequelize.STRING},
}, {
    sequelize,
    modelName: 'authorized_people',
    underscored: true
})

AuthorizedPeople.belongsTo(Business);


class Shareholder extends Model {
}

Shareholder.init({
    name: {type: Sequelize.STRING},
    capitalInEur: {type: Sequelize.STRING},
    capitalInPercent: {type: Sequelize.STRING},
}, {
    sequelize,
    modelName: 'shareholder',
    underscored: true
})

Shareholder.belongsTo(Business);

class Unit extends Model {
}

Unit.init({
    number: {type: Sequelize.STRING},
    unitNumber: {type: Sequelize.STRING},
    name: {type: Sequelize.STRING},
    place: {type: Sequelize.STRING},
}, {
    sequelize,
    modelName: 'unit',
    underscored: true
})

Unit.belongsTo(Business)

class Activity extends Model {
}

Activity.init({
    code: {type: Sequelize.STRING},
    description: {type: Sequelize.STRING},
    type: {type: Sequelize.STRING},
}, {
    sequelize,
    modelName: 'activity',
    underscored: true
})

Activity.belongsTo(Business)

sequelize.sync();
module.exports = {Url, Business, Shareholder, AuthorizedPeople, Unit, Activity};
