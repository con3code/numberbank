/*

    NumberBank
    Scratch3.0 Extension

    Web:
    https://con3.com/numberbank/

*/


const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const Variable = require('../../engine/variable');
const formatMessage = require('format-message');
const firebase = require("firebase");
require("firebase/firestore");


// Variables
let firestoreDb;
let masterDb;
let bankDb;
let cardDb;
let masterKey = '';
let bankName = '';
let bankKey = '';
let cardKey = '';
let uniKey = '';
let cloudNum = '';
let settingNum ='';
let masterSha256 = '';
let bankSha256 = '';
let cardSha256 = '';
let uniSha256 = '';
let inoutFlag = false;
let availableFlag = false;
let intervalMsPut = 1500;
let intervalMsSet = 1000;
let intervalMsGet = 1000;
let intervalMsRep = 1000;
let intervalMsAvl = 100;
const projectName ='numberbank-';
const extVersion = "NumberBank 0.7.5";

/** Firebase Configuration */
let firebaseConfig = {
    apiKey: "AIzaSyA1iKV2IluAbBaO0A8yrKbNi7odxE1AaX8",
    authDomain: ".firebaseapp.com",
    databaseURL: ".firebaseio.com",
    projectId: "",
    storageBucket: ".appspot.com",
    messagingSenderId: "368738644656",
    appId: "1:368738644656:web:c858b84c08784215ec8175",
    measurementId: "G-DLFL2V0M98"
};


/**
* Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
* @type {string}
*/
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgIHhtbDpzcGFjZT0icHJlc2VydmUiIGlkPSJudW1iZXJiYW5raWNvbiI+CiAgICA8IS0tIEdlbmVyYXRlZCBieSBQYWludENvZGUgLSBodHRwOi8vd3d3LnBhaW50Y29kZWFwcC5jb20gLS0+CiAgICA8ZyBpZD0ibnVtYmVyYmFua2ljb24tZ3JvdXAiPgogICAgICAgIDxlbGxpcHNlIGlkPSJudW1iZXJiYW5raWNvbi1vdmFsIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9IjguNSIgY3k9IjM4IiByeD0iOC41IiByeT0iOSIgLz4KICAgICAgICA8ZWxsaXBzZSBpZD0ibnVtYmVyYmFua2ljb24tb3ZhbDIiIHN0cm9rZT0ibm9uZSIgZmlsbD0icmdiKDEyOCwgMTI4LCAxMjgpIiBjeD0iMjMuNzUiIGN5PSIzMiIgcng9IjE1LjI1IiByeT0iMTUiIC8+CiAgICAgICAgPGVsbGlwc2UgaWQ9Im51bWJlcmJhbmtpY29uLW92YWwzIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9IjM5Ljc1IiBjeT0iMzIiIHJ4PSIxMi4yNSIgcnk9IjEzIiAvPgogICAgPC9nPgogICAgCiAgICA8dGV4dCAgZmlsbD0icmdiKDAsIDAsIDApIiBmb250LWZhbWlseT0iQW1lcmljYW5UeXBld3JpdGVyLUJvbGQsICdBbWVyaWNhbiBUeXBld3JpdGVyJywgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMzUiIHg9IjUiIHk9Ii0wIj48dHNwYW4geD0iNSIgeT0iMzAiPk48L3RzcGFuPjwvdGV4dD4KPC9zdmc+Cg=='

/**
* Icon svg to be displayed in the category menu, encoded as a data URI.
* @type {string}
*/
// eslint-disable-next-line max-len
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgIHhtbDpzcGFjZT0icHJlc2VydmUiIGlkPSJudW1iZXJiYW5raWNvbiI+CiAgICA8IS0tIEdlbmVyYXRlZCBieSBQYWludENvZGUgLSBodHRwOi8vd3d3LnBhaW50Y29kZWFwcC5jb20gLS0+CiAgICA8ZyBpZD0ibnVtYmVyYmFua2ljb24tZ3JvdXAiPgogICAgICAgIDxlbGxpcHNlIGlkPSJudW1iZXJiYW5raWNvbi1vdmFsIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9IjguNSIgY3k9IjM4IiByeD0iOC41IiByeT0iOSIgLz4KICAgICAgICA8ZWxsaXBzZSBpZD0ibnVtYmVyYmFua2ljb24tb3ZhbDIiIHN0cm9rZT0ibm9uZSIgZmlsbD0icmdiKDEyOCwgMTI4LCAxMjgpIiBjeD0iMjMuNzUiIGN5PSIzMiIgcng9IjE1LjI1IiByeT0iMTUiIC8+CiAgICAgICAgPGVsbGlwc2UgaWQ9Im51bWJlcmJhbmtpY29uLW92YWwzIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9IjM5Ljc1IiBjeT0iMzIiIHJ4PSIxMi4yNSIgcnk9IjEzIiAvPgogICAgPC9nPgogICAgCiAgICA8dGV4dCAgZmlsbD0icmdiKDAsIDAsIDApIiBmb250LWZhbWlseT0iQW1lcmljYW5UeXBld3JpdGVyLUJvbGQsICdBbWVyaWNhbiBUeXBld3JpdGVyJywgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMzUiIHg9IjUiIHk9Ii0wIj48dHNwYW4geD0iNSIgeT0iMzAiPk48L3RzcGFuPjwvdGV4dD4KPC9zdmc+Cg=='


function sleep(msec) {
    return new Promise(resolve =>
        setTimeout(() => {
            resolve();
        }, msec)
    );
}

function ioWaiter(msec) {
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            if(inoutFlag){
                reject();
            }else{
                resolve();
            }
        }, msec)
    )
    .catch(() => {
        return ioWaiter(msec);
    });
}

function reportNumWaiter(msec) {
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            if(inoutFlag){
                reject();
            }else{
                resolve(cloudNum);
            }
        }, msec)
    )
    .catch(() => {
        return reportNumWaiter(msec);
    });
}

function availableWaiter(msec) {
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            if(inoutFlag){
                reject();
            }else{
                resolve(availableFlag);
            }
        }, msec)
    )
    .catch(() => {
        return availableWaiter(msec);
    });
}

function hexString(textStr) {
    const byteArray = new Uint8Array(textStr);
    const hexCodes = [...byteArray].map(value => {
        const hexCode = value.toString(16);
        const paddedHexCode = hexCode.padStart(2, '0');
        return paddedHexCode;
    });
    return hexCodes.join('');
}


/** Project Id for nb only for con3office */
const prjtId = "68d06";

/**
* Class for the NumberBank with Scratch 3.0
* @param {Runtime} runtime - the runtime instantiating this block package.
* @constructor
*/

class Scratch3Numberbank {
    constructor (runtime) {
        /**
        * The runtime instantiating this block package.
        * @type {Runtime}
        */
        this.runtime = runtime;

        //console.log("initializing...");
        console.log(extVersion);


        /** Firebase initilizing only for con3office */
        let fb_id = projectName.concat(prjtId);
        firebaseConfig.projectId = fb_id;
        let fb_dm = fb_id.concat(firebaseConfig.authDomain);
        firebaseConfig.authDomain = fb_dm;
        let fb_sb = fb_id.concat(firebaseConfig.storageBucket);
        firebaseConfig.storageBucket = fb_sb;
        let fb_ul = 'https://'.concat(fb_id).concat(firebaseConfig.databaseURL);
        firebaseConfig.databaseURL = fb_ul;
        /** Firebase initilizing only for con3office */


        firebase.initializeApp(firebaseConfig);

        firestoreDb = firebase.firestore();
        masterDb = firestoreDb.collection("master");
        bankDb = firestoreDb.collection("bank");
        cardDb = firestoreDb.collection("card");

        //console.log("init_done");

    }


    /**
    * @returns {object} metadata for this extension and its blocks.
    */
    getInfo () {

        this.setupTranslations();

        return {
            id: 'numberbank',
            name: formatMessage({
                id: 'numberbank.NumberBank',
                default: 'NumberBank'
            }),
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'putNum',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.putNum',
                        default: 'put[NUM]to[CARD]of[BANK]',
                        description: 'put number to Firebase'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.bank',
                                default: 'bank'
                            })
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.card',
                                default: 'card'
                            })
                        },
                        NUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '10'
                        }
                    }
                },
                '---',
                {
                    opcode: 'setNum',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.setNum',
                        default: 'set [VAL] to number of[CARD]of[BANK]',
                        description: 'set number by Firebase'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.bank',
                                default: 'bank'
                            })
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.card',
                                default: 'card'
                            })
                        },
                        VAL: {
                            type: ArgumentType.STRING,
                            fieldName: 'VARIABLE',
                            variableType: Variable.SCALAR_TYPE,            
                            menu: 'valMenu'
                        }
                    }
                },
                '---',
                {
                    opcode: 'getNum',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.getNum',
                        default: 'get number of[CARD]of[BANK]',
                        description: 'get number from Firebase'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.bank',
                                default: 'bank'
                            })
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.card',
                                default: 'card'
                            })
                        }
                    }
                },
                {
                    opcode: 'repNum',
                    text: formatMessage({
                        id: 'numberbank.repNum',
                        default: 'cloud number',
                        description: 'report Number'
                    }),
                    blockType: BlockType.REPORTER
                },
                '---',
                {
                    opcode: 'repCloudNum',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'numberbank.repCloudNum',
                        default: 'number of[CARD]of[BANK]',
                        description: 'report Cloud number'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.bank',
                                default: 'bank'
                            })
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.card',
                                default: 'card'
                            })
                        }
                    }
                },
                '---',
                {
                    opcode: 'boolAvl',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'numberbank.boolAvl',
                        default: '[CARD]of[BANK] available?',
                        description: 'report Number'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.bank',
                                default: 'bank'
                            })
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.card',
                                default: 'card'
                            })
                        }
                    }
                },
                '---',
                {
                    opcode: 'setMaster',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.setMaster',
                        default: 'set Master[KEY]',
                        description: 'readFirebase'
                    }),
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.key',
                                default: 'key'
                            })
                        }
                    }
                },
            ],
            menus: {
                valMenu: {
                    acceptReporters: true,
                    items: 'getDynamicMenuItems'
                }
            }
            /*
            ,
            translation_map: {
                'ja': {
                    'numberbank.NumberBank': 'ナンバーバンク',
                    'numberbank.argments.bank': 'バンク',
                    'numberbank.argments.card': 'カード',
                    'numberbank.argments.key': 'キー',
                    'numberbank.putNum': '[BANK]の[CARD]の数字を[NUM]にする',
                    'numberbank.setNum': '[VAL]を[BANK]の[CARD]の数字にする',
                    'numberbank.inoutDone': '読み書き完了',
                    'numberbank.getNum': '[BANK]の[CARD]を読む',
                    'numberbank.repNum': 'クラウド数字',
                    'numberbank.repCloudNum': '[BANK]の[CARD]の数字',
                    'numberbank.boolAvl': '[BANK]の[CARD]がある',
                    'numberbank.setMaster': 'マスター[KEY]をセット'
                },
                'ja-Hira': {
                    'numberbank.NumberBank': 'なんばーばんく',
                    'numberbank.argments.bank': 'ばんく',
                    'numberbank.argments.card': 'かーど',
                    'numberbank.argments.key': 'きー',
                    'numberbank.putNum': '[BANK]の[CARD]のすうじを[NUM]にする',
                    'numberbank.setNum': '[VAL]を[BANK]の[CARD]のすうじにする',
                    'numberbank.inoutDone': 'よみかきかんりょう',
                    'numberbank.getNum': '[BANK]の[CARD]をよむ',
                    'numberbank.repNum': 'クラウドすうじ',
                    'numberbank.repCloudNum': '[BANK]の[CARD]のすうじ',
                    'numberbank.boolAvl': '[BANK]の[CARD]がある',
                    'numberbank.setMaster': 'ますたー[KEY]をセット'
                }
            }
            */
        };
    }
    

    getDynamicMenuItems () {
        return this.runtime.getEditingTarget().getAllVariableNamesInScopeByType(Variable.SCALAR_TYPE);
    }


    putNum (args) {

        if (masterSha256 == ''){ return; }

        if (args.BANK == '' || args.CARD == '' || args.NUM == '') { return; }
        
        if (inoutFlag){ return; }
        inoutFlag = true;

        //console.log("putNum...");

        bankKey = bankName = args.BANK;
        cardKey = args.CARD;

        uniKey = bankKey.trim().concat(cardKey.trim());
        //console.log("uniKey: " + uniKey);    

        if(args.NUM != '' && args.NUM != undefined){
            settingNum = args.NUM;
            //console.log("settingNum: " + settingNum);    
        }
        
        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bankKey != '' && bankKey != undefined){
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(bankKey))
            .then(bankStr => {
                bankSha256 = hexString(bankStr);
                //console.log("bankSha256: " + bankSha256);    
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(cardKey))
                .then(cardStr => {
                    cardSha256 = hexString(cardStr);
                    //console.log("cardSha256: " + cardSha256);
                })
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(uniKey))
                .then(uniStr => {
                    uniSha256 = hexString(uniStr);
                    //console.log("uniSha256: " + uniSha256);
                })
            })
            .then(() => {
                //console.log("masterSha256: " + masterSha256);

                masterDb.doc(masterSha256).get().then(function(mkey) {
                    if (mkey.exists) {
                        const now = Date.now();
                        cardDb.doc(uniSha256).set({
                            number: settingNum,
                            bank_key: bankSha256,
                            card_key: cardSha256,
                            master_key: masterSha256,
                            time_stamp: now
                        })
                        .then(() => {
                            bankDb.doc(bankSha256).set({
                                bank_name: bankName,
                                time_stamp: now
                            })
                        })
                        .then(() => {
                            inoutFlag = false;
                        })
                        .catch(function(error) {
                            console.error("Error writing document: ", error);
                            inoutFlag = false;
                        });
        
                    } else {
                        console.log("No MasterKey!");
                        inoutFlag = false;
                    }

                }).catch(function(error) {
                    console.log("Error getting document:", error);
                    inoutFlag = false;
                });
                
            });

        }

        return ioWaiter(intervalMsPut);

    }


    setNum (args, util) {

        if (masterSha256 == ''){ return; }

        if (args.BANK == '' || args.CARD == ''){ return; }

        if (inoutFlag){ return; }
        inoutFlag = true;

        //console.log("setNum...");

        const variable = util.target.lookupOrCreateVariable(null, args.VAL);

        bankKey = bankName = args.BANK;
        cardKey = args.CARD;

        uniKey = bankKey.trim().concat(cardKey.trim());
        //console.log("uniKey: " + uniKey);    

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bankKey != '' && bankKey != undefined){
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(bankKey))
            .then(bankStr => {
                bankSha256 = hexString(bankStr);
                //console.log("bankSha256: " + bankSha256);    
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(cardKey))
                .then(cardStr => {
                    cardSha256 = hexString(cardStr);
                    //console.log("cardSha256: " + cardSha256);
                })
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(uniKey))
                .then(uniStr => {
                    uniSha256 = hexString(uniStr);
                    //console.log("uniSha256: " + uniSha256);
                })
            })
            .then(() => {
                //console.log("masterSha256: " + masterSha256);

                masterDb.doc(masterSha256).get().then(function(mkey) {

                    if (mkey.exists) {

                        cardDb.doc(uniSha256).get().then(function(ckey) {

                            if (ckey.exists) {

                                cardDb.doc(uniSha256).get()
                                .then((doc) => {
                                    let data = doc.data();
                                    variable.value = data.number;
                                })
                                .then(() => {
                                    inoutFlag = false;
                                })                   
                                .catch(function(error) {
                                        console.error("Error getting document: ", error);
                                });

                            } else {
                                //console.log("No Card!");
                                variable.value = '';
                                inoutFlag = false;
                            }

                        }).catch(function(error) {
                            console.log("Error cheking document:", error);
                            inoutFlag = false;
                        });
    
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No MasterKey!");
                        inoutFlag = false;
                    }

                }).catch(function(error) {
                    console.log("Error getting document:", error);
                    inoutFlag = false;
                });
                
            });

        }

        return ioWaiter(intervalMsSet);

    }


    inoutDone () {
        return !inoutFlag;
    }

    
    getNum (args) {

        if (masterSha256 == ''){ return; }

        if (args.BANK == '' || args.CARD == ''){ return; }

        if (inoutFlag){ return; }
        inoutFlag = true;

        //console.log("getNum...");

        bankKey = bankName = args.BANK;
        cardKey = args.CARD;

        uniKey = bankKey.trim().concat(cardKey.trim());
        //console.log("uniKey: " + uniKey);    

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bankKey != '' && bankKey != undefined){
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(bankKey))
            .then(bankStr => {
                bankSha256 = hexString(bankStr);
                //console.log("bankSha256: " + bankSha256);    
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(cardKey))
                .then(cardStr => {
                    cardSha256 = hexString(cardStr);
                    //console.log("cardSha256: " + cardSha256);
                })
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(uniKey))
                .then(uniStr => {
                    uniSha256 = hexString(uniStr);
                    //console.log("uniSha256: " + uniSha256);
                })
            })
            .then(() => {
                //console.log("masterSha256: " + masterSha256);

                masterDb.doc(masterSha256).get().then(function(mkey) {

                    if (mkey.exists) {

                        cardDb.doc(uniSha256).get().then(function(ckey) {

                            if (ckey.exists) {

                                cardDb.doc(uniSha256).get()
                                .then((doc) => {
                                    let data = doc.data();
                                    cloudNum = data.number;
                                })
                                .then(() => {
                                    inoutFlag = false;
                                })                   
                                .catch(function(error) {
                                        console.error("Error getting document: ", error);
                                });

                            } else {
                                //console.log("No Card!");
                                cloudNum = '';
                                inoutFlag = false;
                            }

                        }).catch(function(error) {
                            console.log("Error cheking document:", error);
                            inoutFlag = false;
                        });
    
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No MasterKey!");
                        inoutFlag = false;
                    }

                })
                .catch(function(error) {
                    console.log("Error getting document:", error);
                    inoutFlag = false;
                });
                
            });

        }

        return ioWaiter(intervalMsGet);

    }


    repNum (args, util) {
        return cloudNum;
    }


    repCloudNum (args) {

        if (masterSha256 == ''){ return; }

        if (args.BANK == '' || args.CARD == ''){ return; }

        if (inoutFlag){ return; }
        inoutFlag = true;

        //console.log("repCloudNum...");

        bankKey = bankName = args.BANK;
        cardKey = args.CARD;

        uniKey = bankKey.trim().concat(cardKey.trim());
        //console.log("uniKey: " + uniKey);

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bankKey != '' && bankKey != undefined){
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(bankKey))
            .then(bankStr => {
                bankSha256 = hexString(bankStr);
                //console.log("bankSha256: " + bankSha256);
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(cardKey))
                .then(cardStr => {
                    cardSha256 = hexString(cardStr);
                    //console.log("cardSha256: " + cardSha256);
                })
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(uniKey))
                .then(uniStr => {
                    uniSha256 = hexString(uniStr);
                    //console.log("uniSha256: " + uniSha256);
                })
            })
            .then(() => {
                //console.log("masterSha256: " + masterSha256);

                masterDb.doc(masterSha256).get().then(function(mkey) {

                    if (mkey.exists) {

                        cardDb.doc(uniSha256).get().then(function(ckey) {

                            if (ckey.exists) {

                                cardDb.doc(uniSha256).get()
                                .then((doc) => {
                                    let data = doc.data();
                                    cloudNum = data.number;
                                })
                                .then(() => {
                                    inoutFlag = false;
                                })                   
                                .catch(function(error) {
                                    console.error("Error getting document: ", error);
                                });

                            } else {
                                //console.log("No Card!");
                                cloudNum = '';
                                inoutFlag = false;
                            }

                        }).catch(function(error) {
                            console.log("Error cheking document:", error);
                            inoutFlag = false;
                        });
    
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No MasterKey!");
                        inoutFlag = false;
                    }

                })
                .catch(function(error) {
                    console.log("Error getting document:", error);
                    inoutFlag = false;
                });
                
            });

        }

        return reportNumWaiter(intervalMsRep);

    }


    boolAvl (args, util) {

        if (masterSha256 == ''){ return; }

        if (args.BANK == '' || args.CARD == ''){ return; }

        if (inoutFlag){ return; }
        inoutFlag = true;

        //console.log("boolAvl...");

        bankKey = bankName = args.BANK;
        cardKey = args.CARD;

        uniKey = bankKey.trim().concat(cardKey.trim());
        //console.log("uniKey: " + uniKey);    

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bankKey != '' && bankKey != undefined){

            crypto.subtle.digest('SHA-256', new TextEncoder().encode(uniKey))
            .then(uniStr => {
                uniSha256 = hexString(uniStr);
                //console.log("uniSha256: " + uniSha256);
            })
            .then(() => {
                //console.log("masterSha256: " + masterSha256);
                
                masterDb.doc(masterSha256).get().then(function(mkey) {
                
                    if (mkey.exists) {

                        cardDb.doc(uniSha256).get().then(function(ckey) {

                            if (ckey.exists) {
                                //console.log("Available!");
                                inoutFlag = false;
                                availableFlag = true;
                            } else {
                                //console.log("No Available!");
                                inoutFlag = false;
                                availableFlag = false;
                            }

                        }).catch(function(error) {
                            console.log("Error checking document:", error);
                            inoutFlag = false;
                            availableFlag = false;
                        });
    
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No MasterKey!");
                        inoutFlag = false;
                        availableFlag = false;
                    }
                
                })
                .catch(function(error) {
                    console.log("Error getting document:", error);
                    inoutFlag = false;
                    availableFlag = false;
                });
                                
            })

        }

        return availableWaiter(intervalMsAvl);

    }


    setMaster (args) {

        if (args.KEY == ''){ return; }

        masterSha256 = '';
        masterKey = args.KEY;

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        crypto.subtle.digest('SHA-256', new TextEncoder().encode(masterKey))
        .then(masterStr => {
            masterSha256 = hexString(masterStr);
        })
        .then(() => {
            //console.log("MasterKey:", masterKey);
            //console.log("masterSha256:", masterSha256);
            console.log("MasterKey setted!");
        })
        .catch(function(error) {
            console.log("Error setting MasterKey:", error);
        });

    }


    setupTranslations () {
        const localeSetup = formatMessage.setup();
        const extensionTranslations = {
            'ja': {
                'numberbank.NumberBank': 'ナンバーバンク',
                'numberbank.argments.bank': 'バンク',
                'numberbank.argments.card': 'カード',
                'numberbank.argments.key': 'キー',
                'numberbank.putNum': '[BANK]の[CARD]の数字を[NUM]にする',
                'numberbank.setNum': '[VAL]を[BANK]の[CARD]の数字にする',
                'numberbank.inoutDone': '読み書き完了',
                'numberbank.getNum': '[BANK]の[CARD]を読む',
                'numberbank.repNum': 'クラウド数字',
                'numberbank.repCloudNum': '[BANK]の[CARD]の数字',
                'numberbank.boolAvl': '[BANK]の[CARD]がある',
                'numberbank.setMaster': 'マスター[KEY]をセット'
            },
            'ja-Hira': {
                'numberbank.NumberBank': 'なんばーばんく',
                'numberbank.argments.bank': 'ばんく',
                'numberbank.argments.card': 'かーど',
                'numberbank.argments.key': 'きー',
                'numberbank.putNum': '[BANK]の[CARD]のすうじを[NUM]にする',
                'numberbank.setNum': '[VAL]を[BANK]の[CARD]のすうじにする',
                'numberbank.inoutDone': 'よみかきかんりょう',
                'numberbank.getNum': '[BANK]の[CARD]をよむ',
                'numberbank.repNum': 'クラウドすうじ',
                'numberbank.repCloudNum': '[BANK]の[CARD]のすうじ',
                'numberbank.boolAvl': '[BANK]の[CARD]がある',
                'numberbank.setMaster': 'ますたー[KEY]をセット'
            }
        };

        for (const locale in extensionTranslations) {
            if (!localeSetup.translations[locale]) {
                localeSetup.translations[locale] = {};
            }
            Object.assign(localeSetup.translations[locale], extensionTranslations[locale]);
        }
    }

}

module.exports = Scratch3Numberbank;
